package mtpcoord

import "sync/atomic"

// Coordinator guarantees that only one operation can use the shared MTP
// device handle at a time. MTP/libusb device handles are not concurrency-safe.
type Coordinator struct {
	active uint32
}

// TryAcquire reserves the device handle for one operation without blocking a
// native callback thread. The caller must call Release after a successful
// acquisition.
func (c *Coordinator) TryAcquire() bool {
	return atomic.CompareAndSwapUint32(&c.active, 0, 1)
}

// Release makes the device handle available to the next operation.
func (c *Coordinator) Release() {
	atomic.StoreUint32(&c.active, 0)
}

// IsActive reports whether an operation currently owns the device handle.
func (c *Coordinator) IsActive() bool {
	return atomic.LoadUint32(&c.active) == 1
}
