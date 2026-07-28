package main

import (
	"fmt"
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
	"log"
	"strings"
)

func verifyMtpSession(c verifyMtpSessionMode) error {
	if container.dev == nil {
		return fmt.Errorf("ErrorMtpDetectFailed")
	}

	if !c.skipDeviceChangeCheck && container.deviceInfo != nil {
		dInfo, err := mtpx.FetchDeviceInfo(container.dev)
		if err != nil {
			invalidateMtpSession()

			return err
		}

		if container.deviceInfo.SerialNumber != dInfo.SerialNumber {
			container.deviceInfo = dInfo

			return fmt.Errorf("ErrorDeviceChanged")
		}
	}

	return nil
}

func _initialize(i mtpx.Init) (*mtp.Device, error) {
	if container.dev != nil {
		if err := _dispose(); err != nil {
			return nil, err
		}
	}

	d, err := mtpx.Initialize(i)
	if err != nil {
		invalidateMtpSession()

		return nil, err
	}

	container.dev = d

	return d, nil
}

func _fetchDeviceInfo() (*mtp.DeviceInfo, error) {
	v := verifyMtpSessionMode{skipDeviceChangeCheck: true}

	if !v.skipDeviceChangeCheck {
		log.Panicln("'skipDeviceChangeCheck' should be 'true' in _fetchDeviceInfo.verifyMtpSessionMode")
	}

	if err := verifyMtpSession(v); err != nil {
		return nil, err
	}

	dInfo, err := mtpx.FetchDeviceInfo(container.dev)
	if err != nil {
		invalidateMtpSession()

		return nil, err
	}

	container.deviceInfo = dInfo

	return dInfo, nil
}

func _fetchStorages() ([]mtpx.StorageData, error) {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return nil, err
	}

	storages, err := mtpx.FetchStorages(container.dev)
	if err != nil {
		invalidateMtpSessionOnFatalError(err)

		return nil, err
	}

	return storages, nil
}

func _makeDirectory(storageId uint32, fullPath string) error {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return err
	}

	_, err := mtpx.MakeDirectory(container.dev, storageId, fullPath)
	if err != nil {
		invalidateMtpSessionOnFatalError(err)

		return err
	}

	return nil
}

func _fileExists(storageId uint32, fileProps []mtpx.FileProp) (exists []mtpx.FileExistsContainer, error error) {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return []mtpx.FileExistsContainer{}, err
	}

	exists, err := mtpx.FileExists(container.dev, storageId, fileProps)
	if err != nil {
		invalidateMtpSessionOnFatalError(err)

		return exists, err
	}

	return exists, nil
}

func _deleteFile(storageId uint32, fileProps []mtpx.FileProp) (error error) {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return err
	}

	err := mtpx.DeleteFile(container.dev, storageId, fileProps)
	if err != nil {
		invalidateMtpSessionOnFatalError(err)

		return err
	}

	return nil
}

func _renameFile(storageId uint32, fileProp mtpx.FileProp, newFileName string) (error error) {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return err
	}

	_, err := mtpx.RenameFile(container.dev, storageId, fileProp, newFileName)
	if err != nil {
		invalidateMtpSessionOnFatalError(err)

		return err
	}

	return nil
}

func _walk(storageId uint32, fullPath string, recursive, skipDisallowedFiles, skipHiddenFiles bool) (files []*mtpx.FileInfo, err error) {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return []*mtpx.FileInfo{}, err
	}

	_, _, _, err = mtpx.Walk(container.dev, storageId, fullPath, recursive, skipDisallowedFiles, skipHiddenFiles, func(objectId uint32, fi *mtpx.FileInfo, err error) error {
		if err != nil {
			return err
		}

		files = append(files, fi)

		return nil
	})
	if err != nil {
		invalidateMtpSessionOnFatalError(err)

		return []*mtpx.FileInfo{}, err
	}

	return files, nil
}

func _uploadFiles(storageId uint32, sources []string, destination string, preprocessFiles bool, preprocessCb mtpx.LocalPreprocessCb, progressCb mtpx.ProgressCb) (err error) {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return err
	}

	_, _, _, err = mtpx.UploadFiles(container.dev, storageId, sources, destination, preprocessFiles, preprocessCb, progressCb)
	if err != nil {
		invalidateMtpSessionOnFatalError(err)

		return err
	}

	return nil
}

func _downloadFiles(storageId uint32, sources []string, destination string, preprocessFiles bool, preprocessCb mtpx.MtpPreprocessCb, progressCb mtpx.ProgressCb) (err error) {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return err
	}

	_, _, err = mtpx.DownloadFiles(container.dev, storageId, sources, destination, preprocessFiles, preprocessCb, progressCb)
	if err != nil {
		invalidateMtpSessionOnFatalError(err)

		return err
	}

	return nil
}

func _dispose() error {
	dev := container.dev

	container.dev = nil
	container.deviceInfo = nil

	if dev == nil {
		return nil
	}

	mtpx.Dispose(dev)

	return nil
}

func invalidateMtpSession() {
	container.dev = nil
	container.deviceInfo = nil
}

func invalidateMtpSessionOnFatalError(err error) {
	if err == nil {
		return
	}

	errorText := strings.ToUpper(err.Error())
	if strings.Contains(errorText, "LIBUSB_ERROR_") || strings.Contains(errorText, "EOF") {
		invalidateMtpSession()
	}
}

func lockMtp() error {
	if !container.operation.TryAcquire() {
		return fmt.Errorf("ErrorMtpLockExists")
	}

	return nil
}

func unlockMtp() {
	container.operation.Release()
}
