import { log } from '../utils/log';
import { normalizeTransferError } from './fileTransfer';

export function logTransferEvent({
  sessionId,
  event,
  details = {},
  error = null,
}) {
  const diagnosticId = sessionId || 'transfer-unassigned';
  const serializedDetails = JSON.stringify(details);
  const title = `[File transfer ${diagnosticId}] ${event}`;

  if (error) {
    return log.doLog(
      `${normalizeTransferError(error)}\nDetails: ${serializedDetails}`,
      title,
      null,
      true,
      false,
      true
    );
  }

  return log.doLog(serializedDetails, title, null, true, false, false);
}
