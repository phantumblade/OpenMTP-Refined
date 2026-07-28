package mtpcoord

import (
	"sync"
	"sync/atomic"
	"testing"
)

func TestCoordinatorAllowsOnlyOneConcurrentOwner(t *testing.T) {
	var coordinator Coordinator
	var winners int32
	var waitGroup sync.WaitGroup
	start := make(chan struct{})

	for index := 0; index < 64; index++ {
		waitGroup.Add(1)

		go func() {
			defer waitGroup.Done()
			<-start

			if coordinator.TryAcquire() {
				atomic.AddInt32(&winners, 1)
			}
		}()
	}

	close(start)
	waitGroup.Wait()

	if winners != 1 {
		t.Fatalf("expected exactly one owner, got %d", winners)
	}

	if !coordinator.IsActive() {
		t.Fatal("coordinator should report an active operation")
	}

	coordinator.Release()

	if coordinator.IsActive() {
		t.Fatal("coordinator should be idle after release")
	}

	if !coordinator.TryAcquire() {
		t.Fatal("coordinator should be reusable after release")
	}
}
