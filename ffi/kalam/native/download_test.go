package main

import (
	"testing"
	"time"
)

func TestDownloadDestination(t *testing.T) {
	cases := []struct{ object, source, root, want string }{
		// a file picked in a folder
		{"/Download/Quick Share/IMG_1.jpg", "/Download/Quick Share/IMG_1.jpg", "/Volumes/SSD/QuickShare", "/Volumes/SSD/QuickShare/IMG_1.jpg"},
		// a folder picked: itself, then its contents below it
		{"/DCIM/Camera", "/DCIM/Camera", "/Users/a/Pictures", "/Users/a/Pictures/Camera"},
		{"/DCIM/Camera/2026/V.mp4", "/DCIM/Camera", "/Users/a/Pictures", "/Users/a/Pictures/Camera/2026/V.mp4"},
		// the whole phone
		{"/", "/", "/tmp/phone", "/tmp/phone"},
		{"/Music/a.mp3", "/", "/tmp/phone", "/tmp/phone/Music/a.mp3"},
		// trailing slashes and a sibling sharing the prefix
		{"/DCIM/Camera/x.jpg", "/DCIM/Camera/", "/tmp/out/", "/tmp/out/Camera/x.jpg"},
	}

	for _, c := range cases {
		if got := downloadDestination(c.object, c.source, c.root); got != c.want {
			t.Errorf("downloadDestination(%q, %q, %q) = %q, want %q", c.object, c.source, c.root, got, c.want)
		}
	}
}

func TestTransferSpeedNeverNegative(t *testing.T) {
	if transferSpeed(1000, timeNowPlus(1)) != 0 {
		t.Error("a start time in the future must give 0 MB/s")
	}
}

func timeNowPlus(seconds int) time.Time {
	return time.Now().Add(time.Duration(seconds) * time.Second)
}
