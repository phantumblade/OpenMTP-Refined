package mtp

import (
	"fmt"
	"log"
	"time"

	"github.com/ganeshrvel/usb"
)

// OpenMTP addition to go-mtpfs.
//
// When a Mac host (usually macOS' ptpcamerad, which lists every file of a
// phone as soon as it is plugged in) is stopped mid-transaction, Android's
// MTP server keeps working on that request: with tens of thousands of files
// it can stay busy for a minute, then blocks until its reply is read. Meanwhile
// it doesn't read new requests, so OpenSession times out. Resetting the USB
// device then (the original behaviour) restarts the connection and the
// listing, so the phone often never answered. ConfigureRobust waits instead.

// How long ConfigureRobust keeps trying before it gives up.
const (
	robustTotal          = 120 * time.Second
	robustSessionTimeout = 2000 // ms, per OpenSession attempt
	robustDrainQuiet     = 400 * time.Millisecond
	robustDrainPoll      = 150 // ms, per bulk-in read while draining
	robustStorageWait    = 5 * time.Second
)

// drainIn reads and discards whatever the device is still trying to send,
// usually the reply to a request of a host that vanished (for example
// macOS ptpcamerad killed mid-transaction). Android's MTP server blocks
// while that reply is pending and cannot read our next request, so it has
// to be consumed first. It stops after the pipe has been quiet for `quiet`.
func (d *Device) drainIn(quiet time.Duration) (int, error) {
	buf := make([]byte, 16*1024)
	total := 0
	lastData := time.Now()

	for time.Since(lastData) < quiet {
		n, err := d.h.BulkTransfer(d.fetchEP, buf, robustDrainPoll)
		if n > 0 {
			total += n
			lastData = time.Now()

			continue
		}

		if err == nil || err == usb.ERROR_TIMEOUT {
			continue
		}

		if err == usb.ERROR_PIPE {
			d.h.ClearHalt(d.fetchEP)

			continue
		}

		return total, err
	}

	return total, nil
}

// resyncPipes clears the halt state and data toggle of the bulk pipes.
func (d *Device) resyncPipes() {
	errIn := d.h.ClearHalt(d.fetchEP)
	errOut := d.h.ClearHalt(d.sendEP)
	if d.USBDebug {
		log.Printf("ClearHalt in=%v out=%v", errIn, errOut)
	}
}

// openSessionOnce opens the session with a short timeout, closing a session
// left open by a previous host first.
func (d *Device) openSessionOnce() error {
	timeout := d.Timeout
	d.Timeout = robustSessionTimeout
	defer func() { d.Timeout = timeout }()

	err := d.OpenSession()
	if err == RCError(RC_SessionAlreadyOpened) {
		d.CloseSession()
		err = d.OpenSession()
	}

	return err
}

// waitForStorage gives the phone a moment to publish its storage: Android
// adds it right after the session opens, and an empty list would show an
// empty phone.
func (d *Device) waitForStorage() {
	deadline := time.Now().Add(robustStorageWait)

	for time.Now().Before(deadline) {
		var ids Uint32Array
		if err := d.GetStorageIDs(&ids); err != nil || len(ids.Values) > 0 {
			return
		}

		time.Sleep(250 * time.Millisecond)
	}
}

func isGone(err error) bool {
	return err == usb.ERROR_NO_DEVICE || err == usb.ERROR_NOT_FOUND
}

// ConfigureRobust opens the MTP session on a phone that another host may
// have left mid-transaction. Instead of resetting the USB device (which
// makes Android refuse to start a new MTP server while the old one is still
// alive, and lets macOS daemons grab the phone again), it drains the stale
// reply and retries until the phone answers. A USB reset is the last resort.
func (d *Device) ConfigureRobust() error {
	if d.h == nil {
		if err := d.Open(); err != nil {
			return err
		}
	}

	start := time.Now()
	var err error

	for attempt := 1; time.Since(start) < robustTotal; attempt++ {
		// a host killed mid-transfer leaves the pipes' data toggles out of
		// sync, and the phone then silently drops our packets; CLEAR_HALT
		// resynchronises both ends without re-enumerating the device
		d.resyncPipes()

		drained, derr := d.drainIn(robustDrainQuiet)
		if isGone(derr) {
			return derr
		}

		err = d.openSessionOnce()
		if d.USBDebug || drained > 0 {
			log.Printf("ConfigureRobust attempt %d: drained %d bytes, OpenSession: %v",
				attempt, drained, err)
		}

		if err == nil {
			d.waitForStorage()

			return nil
		}

		if isGone(err) {
			return err
		}

	}

	log.Printf("ConfigureRobust: no answer after %v (%v); attempting reset", robustTotal, err)
	if d.h != nil {
		d.h.Reset()
	}
	d.Close()
	time.Sleep(1000 * time.Millisecond)

	if err := d.Open(); err != nil {
		return fmt.Errorf("opening after reset: %v", err)
	}

	if err := d.openSessionOnce(); err != nil {
		return fmt.Errorf("OpenSession after reset: %v", err)
	}

	return nil
}
