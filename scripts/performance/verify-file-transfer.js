const assert = require('assert');
const {
  createTransferSessionId,
  FILE_TRANSFER_PHASE,
  isTransferPhaseActive,
  isTransferPhaseTerminal,
  isFatalMtpTransportError,
  normalizeTransferError,
  resetTransferProgress,
  transferStepStates,
} = require('../../app/helpers/fileTransfer');
const { isSameUsbDevice } = require('../../app/helpers/deviceInfo');
const { createDisconnectedMtpState } = require('../../app/helpers/mtpSession');

function main() {
  const sessionId = createTransferSessionId(1234567890, 0.5);

  assert.strictEqual(sessionId, 'transfer-kf12oi-4zsov');
  assert.strictEqual(isTransferPhaseActive(FILE_TRANSFER_PHASE.checking), true);
  assert.strictEqual(
    isTransferPhaseActive(FILE_TRANSFER_PHASE.waitingForConfirmation),
    true
  );
  assert.strictEqual(
    isTransferPhaseActive(FILE_TRANSFER_PHASE.transferring),
    true
  );
  assert.strictEqual(isTransferPhaseActive(FILE_TRANSFER_PHASE.failed), false);
  assert.strictEqual(isTransferPhaseTerminal(FILE_TRANSFER_PHASE.failed), true);
  assert.strictEqual(
    isTransferPhaseTerminal(FILE_TRANSFER_PHASE.completed),
    true
  );
  assert.strictEqual(normalizeTransferError(new Error('USB lost')), 'USB lost');
  assert.strictEqual(
    isFatalMtpTransportError(
      new Error('SendObject failed: LIBUSB_ERROR_TIMEOUT'),
      'ErrorSendObject'
    ),
    true
  );
  assert.strictEqual(isFatalMtpTransportError(null, 'ErrorStorageFull'), false);
  assert.strictEqual(
    isSameUsbDevice(
      { serialNumber: 'TEST-SERIAL-001' },
      { SerialNumber: 'test-serial-001' }
    ),
    true
  );
  assert.strictEqual(
    isSameUsbDevice(
      { vendorId: 1256, productId: 20199, serialNumber: '' },
      { IdVendor: 1256, IdProduct: 20199, SerialNumber: '' }
    ),
    true
  );
  assert.strictEqual(
    isSameUsbDevice(
      { serialNumber: 'another-phone', vendorId: 1256, productId: 20199 },
      { SerialNumber: 'TEST-SERIAL-001', IdVendor: 1256, IdProduct: 20199 }
    ),
    false
  );

  const connectedState = {
    currentBrowsePath: { local: '/Users/test', mtp: '/DCIM/Camera' },
    directoryLists: {
      local: { nodes: [{ name: 'local' }], queue: { selected: [] } },
      mtp: {
        nodes: [{ name: 'stale-phone-folder' }],
        queue: { selected: ['/DCIM/Camera'] },
        isLoaded: true,
      },
    },
    multiSelectMode: { local: false, mtp: true },
    mtpDevice: {
      isAvailable: true,
      isLoading: false,
      info: { mtpDeviceInfo: { Model: 'SM-S918B' } },
    },
    mtpStoragesList: { 1: { selected: true } },
    filesDrag: { sourceDeviceType: 'local', destinationDeviceType: 'mtp' },
    fileTransfer: {
      clipboard: { queue: ['/tmp/keep-me.jpg'], source: 'local' },
      progress: {
        toggle: true,
        phase: FILE_TRANSFER_PHASE.transferring,
        sessionId,
      },
    },
  };
  const disconnectedState = createDisconnectedMtpState(connectedState, {
    deviceType: 'mtp',
    defaultPath: '/',
    errorMessage: 'USB disconnected',
    disconnectedAt: 1234567891,
  });

  assert.deepStrictEqual(disconnectedState.directoryLists.mtp.nodes, []);
  assert.deepStrictEqual(
    disconnectedState.directoryLists.mtp.queue.selected,
    []
  );
  assert.strictEqual(disconnectedState.currentBrowsePath.mtp, '/');
  assert.strictEqual(disconnectedState.mtpDevice.isAvailable, false);
  assert.deepStrictEqual(disconnectedState.mtpDevice.info, {});
  assert.deepStrictEqual(disconnectedState.mtpStoragesList, {});
  assert.strictEqual(disconnectedState.multiSelectMode.mtp, false);
  assert.strictEqual(
    disconnectedState.fileTransfer.progress.phase,
    FILE_TRANSFER_PHASE.failed
  );
  assert.deepStrictEqual(disconnectedState.fileTransfer.clipboard.queue, [
    '/tmp/keep-me.jpg',
  ]);

  const preparingSteps = transferStepStates(FILE_TRANSFER_PHASE.preparing);

  assert.strictEqual(preparingSteps[0].complete, true);
  assert.strictEqual(preparingSteps[1].active, true);
  assert.strictEqual(preparingSteps[2].complete, false);

  const state = {
    clipboard: {
      queue: ['/tmp/one.jpg', '/tmp/two.jpg'],
      source: 'local',
      sessionId,
      preparedAt: 1234567890,
    },
    progress: {
      toggle: true,
      sessionId,
      phase: FILE_TRANSFER_PHASE.failed,
      errorMessage: 'USB lost',
    },
  };
  const resetState = resetTransferProgress(state);

  assert.deepStrictEqual(resetState.clipboard.queue, [
    '/tmp/one.jpg',
    '/tmp/two.jpg',
  ]);
  assert.strictEqual(resetState.clipboard.sessionId, sessionId);
  assert.strictEqual(resetState.progress.phase, FILE_TRANSFER_PHASE.idle);
  assert.strictEqual(resetState.progress.toggle, false);

  // eslint-disable-next-line no-console
  console.info(
    'File transfer state, retry preservation and phase invariants: ok'
  );
}

main();
