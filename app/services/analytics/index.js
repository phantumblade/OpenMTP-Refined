import { checkIf } from '../../utils/checkIf';
import { EVENT_TYPE } from '../../enums/events';

// OpenMTP Refined sends no usage statistics: upstream's Google Analytics and
// Mixpanel clients were removed. The service keeps its API so the call sites
// (and the check that every event is a known EVENT_TYPE) stay unchanged.
class AnalyticsService {
  async sendEvent(key, value) {
    checkIf(key, 'inObjectValues', EVENT_TYPE);
    checkIf(value, 'object');
  }

  async init() {
    return null;
  }

  async sendDeviceInfo() {
    return null;
  }
}

export const analyticsService = new AnalyticsService();
