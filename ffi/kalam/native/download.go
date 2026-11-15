package main

import (
	"errors"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"

	"kalam/send_to_js"
)

// Phone -> Mac copy.
//
// go-mtpx finds an object from its path by listing each folder on the way
// and asking the phone for the name of every entry, one request each, until
// one matches; DownloadFiles then does that two or three times per selected
// item. Copying 267 files out of a 273-file folder meant tens of thousands
// of requests: minutes of "preparing" (long enough for a Samsung phone to
// give up with a read error) and a 5.7 GB copy taking 30 minutes instead of
// about 6.
//
// Here every folder on the way is read once per copy (one GetObjectInfo per
// entry, which also gives size, date and type) and kept for the rest of the
// copy, so finding the 200th file costs nothing more than the first. The
// phone isn't changed while copying from it, so the kept listings stay
// right. Objects still come from go-mtpx's GetObjectFromObjectId, so its
// error types (and the messages the app shows for them) are unchanged.

// files the copy skips, like go-mtpx does
var downloadSkippedNames = map[string]bool{
	".DS_Store":                        true,
	"[-----DS_Store.mtp.test----].txt": true,
}

const localDirectoryMode = 0755

// one folder of the phone, read once
type phoneFolder struct {
	entries []*mtpx.FileInfo
	// lower-case name -> first entry with that name (MTP names are matched
	// case-insensitively, like go-mtpx does)
	byName map[string]*mtpx.FileInfo
}

type phoneFolderCache struct {
	dev       *mtp.Device
	storageId uint32
	folders   map[uint32]*phoneFolder
}

func newPhoneFolderCache(dev *mtp.Device, storageId uint32) *phoneFolderCache {
	return &phoneFolderCache{
		dev:       dev,
		storageId: storageId,
		folders:   map[uint32]*phoneFolder{},
	}
}

// the entries of a folder, read from the phone the first time only
func (c *phoneFolderCache) folder(objectId uint32, folderPath string) (*phoneFolder, error) {
	if f, ok := c.folders[objectId]; ok {
		return f, nil
	}

	handles := mtp.Uint32Array{}
	if err := c.dev.GetObjectHandles(c.storageId, mtp.GOH_ALL_ASSOCS, objectId, &handles); err != nil {
		return nil, send_to_js.FileObjectReadError{Err: err}
	}

	f := &phoneFolder{
		entries: make([]*mtpx.FileInfo, 0, len(handles.Values)),
		byName:  make(map[string]*mtpx.FileInfo, len(handles.Values)),
	}

	for _, handle := range handles.Values {
		fi, err := mtpx.GetObjectFromObjectId(c.dev, handle, folderPath)
		if err != nil {
			return nil, err
		}

		f.entries = append(f.entries, fi)

		key := strings.ToLower(fi.Name)
		if _, exists := f.byName[key]; !exists {
			f.byName[key] = fi
		}
	}

	c.folders[objectId] = f

	return f, nil
}

// the object at [fullPath], walking down from the root through kept folders
func (c *phoneFolderCache) resolve(fullPath string) (*mtpx.FileInfo, error) {
	cleanPath := path.Clean("/" + fullPath)

	if cleanPath == "/" {
		return mtpx.GetObjectFromObjectId(c.dev, mtpx.ParentObjectId, "")
	}

	parts := strings.Split(strings.TrimPrefix(cleanPath, "/"), "/")
	parentId := uint32(mtpx.ParentObjectId)
	parentPath := "/"

	var fi *mtpx.FileInfo

	for i, name := range parts {
		f, err := c.folder(parentId, parentPath)
		if err != nil {
			return nil, err
		}

		entry, ok := f.byName[strings.ToLower(name)]
		if !ok || (!entry.IsDir && i < len(parts)-1) {
			// not there: let go-mtpx look it up, so the error is the one the
			// app already knows (path not found)
			return mtpx.GetObjectFromPath(c.dev, c.storageId, cleanPath)
		}

		fi = entry
		parentId = entry.ObjectId
		parentPath = path.Join(parentPath, entry.Name)
	}

	resolved := *fi
	resolved.FullPath = cleanPath

	return &resolved, nil
}

// one object to copy and where it goes on the Mac
type downloadItem struct {
	fi          *mtpx.FileInfo
	destination string
}

// [visit] gets the source itself and, for a folder, everything inside it,
// parents before their contents
func (c *phoneFolderCache) walk(source *mtpx.FileInfo, visit func(fi *mtpx.FileInfo) error) error {
	if downloadSkippedNames[source.Name] {
		return nil
	}

	if err := visit(source); err != nil {
		return err
	}

	if !source.IsDir {
		return nil
	}

	f, err := c.folder(source.ObjectId, source.FullPath)
	if err != nil {
		return err
	}

	for _, entry := range f.entries {
		child := *entry
		child.FullPath = path.Join(source.FullPath, entry.Name)
		child.ParentPath = source.FullPath

		if err := c.walk(&child, visit); err != nil {
			return err
		}
	}

	return nil
}

func localWriteError(err error) error {
	return send_to_js.LocalFileWriteError{
		Err:        err,
		Permission: errors.Is(err, os.ErrPermission),
	}
}

func makeLocalFolder(dir string, modTime time.Time) error {
	if err := os.MkdirAll(dir, localDirectoryMode); err != nil {
		return localWriteError(err)
	}

	return os.Chtimes(dir, time.Now(), modTime.Local())
}

func downloadFilesFast(dev *mtp.Device, storageId uint32, sources []string, destination string,
	preprocessFiles bool, preprocessCb mtpx.MtpPreprocessCb, progressCb mtpx.ProgressCb) error {
	cache := newPhoneFolderCache(dev, storageId)
	destinationRoot := filepath.Clean(destination)

	now := time.Now()
	pInfo := mtpx.ProgressInfo{
		FileInfo:       &mtpx.FileInfo{},
		StartTime:      now,
		LatestSentTime: now,
		ActiveFileSize: &mtpx.TransferSizeInfo{},
		BulkFileSize:   &mtpx.TransferSizeInfo{},
		Status:         mtpx.InProgress,
	}

	var filesSent, bytesSent int64

	// [visit] for every object of every source, in the order chosen
	forEachItem := func(visit func(item downloadItem) error) error {
		for _, source := range sources {
			fi, err := cache.resolve(source)
			if err != nil {
				return err
			}

			err = cache.walk(fi, func(entry *mtpx.FileInfo) error {
				return visit(downloadItem{
					fi:          entry,
					destination: downloadDestination(entry.FullPath, fi.FullPath, destinationRoot),
				})
			})
			if err != nil {
				return err
			}
		}

		return nil
	}

	copyItem := func(item downloadItem) error {
		fi := item.fi

		if fi.IsDir {
			return makeLocalFolder(item.destination, fi.ModTime)
		}

		parent := filepath.Dir(item.destination)
		if _, err := os.Stat(parent); os.IsNotExist(err) {
			if err := makeLocalFolder(parent, time.Now()); err != nil {
				return err
			}
		}

		filesSent += 1
		pInfo.FileInfo = fi
		pInfo.LatestSentTime = time.Now()

		f, err := os.Create(item.destination)
		if err != nil {
			return localWriteError(err)
		}

		var prevSent int64

		report := func(sent int64) error {
			chunk := sent - prevSent
			bytesSent += chunk
			prevSent = sent

			pInfo.ActiveFileSize.Total = fi.Size
			pInfo.ActiveFileSize.Sent = sent
			pInfo.ActiveFileSize.Progress = mtpx.Percent(float32(sent), float32(fi.Size))
			pInfo.BulkFileSize.Sent = bytesSent
			pInfo.BulkFileSize.Progress = mtpx.Percent(float32(bytesSent), float32(pInfo.BulkFileSize.Total))
			pInfo.Speed = transferSpeed(chunk, pInfo.LatestSentTime)
			pInfo.LatestSentTime = time.Now()

			return progressCb(&pInfo, nil)
		}

		err = dev.GetObject(fi.ObjectId, f, report)
		closeErr := f.Close()

		if err != nil {
			return err
		}

		if closeErr != nil {
			return localWriteError(closeErr)
		}

		// some phones report fewer bytes than the file has
		if prevSent < fi.Size {
			if err := report(fi.Size); err != nil {
				return err
			}
		}

		if err := os.Chtimes(item.destination, time.Now(), fi.ModTime.Local()); err != nil {
			return localWriteError(err)
		}

		pInfo.FilesSent = filesSent
		pInfo.FilesSentProgress = mtpx.Percent(float32(filesSent), float32(pInfo.TotalFiles))

		return nil
	}

	if preprocessFiles {
		// count everything first (cheap now: each folder is read once and
		// kept for the copy), so the app can show the overall progress
		var items []downloadItem

		err := forEachItem(func(item downloadItem) error {
			items = append(items, item)

			if item.fi.IsDir {
				pInfo.TotalDirectories += 1

				return nil
			}

			pInfo.TotalFiles += 1
			pInfo.BulkFileSize.Total += item.fi.Size

			return preprocessCb(item.fi, nil)
		})
		if err != nil {
			return err
		}

		for _, item := range items {
			if err := copyItem(item); err != nil {
				return err
			}
		}
	} else if err := forEachItem(copyItem); err != nil {
		return err
	}

	pInfo.Status = mtpx.Completed

	return progressCb(&pInfo, nil)
}

// Where an object of the phone lands on the Mac: the selected item
// [sourcePath] goes into [destinationRoot], and what's inside it keeps its
// place below.
func downloadDestination(objectPath, sourcePath, destinationRoot string) string {
	relative := strings.TrimPrefix(path.Clean(objectPath), path.Dir(path.Clean(sourcePath)))

	return filepath.Join(destinationRoot, filepath.FromSlash(relative))
}

// MB/s of the last chunk, like go-mtpx reports it
func transferSpeed(bytes int64, since time.Time) float64 {
	elapsed := time.Since(since).Nanoseconds()
	if elapsed <= 0 {
		return 0
	}

	rate := float64(bytes) / float64(elapsed) * 1000

	return float64(int64(rate*100+0.5)) / 100
}
