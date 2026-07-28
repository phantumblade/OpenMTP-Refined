import { IS_RENDERER } from '../constants/env';
import { isEmpty } from '../utils/funcs';

const normalizeUsbIdentityValue = (value) =>
  value === undefined || value === null
    ? null
    : value.toString().trim().toLowerCase();

/**
 * usb-detection and Kalam use different property names for the same USB
 * descriptor. Prefer the serial number, then fall back to the VID/PID pair
 * because some Android devices omit their serial number on detach.
 */
export function isSameUsbDevice(hotplugDevice = {}, connectedDevice = {}) {
  const hotplugSerial = normalizeUsbIdentityValue(
    hotplugDevice.serialNumber ?? hotplugDevice.SerialNumber
  );
  const connectedSerial = normalizeUsbIdentityValue(
    connectedDevice.SerialNumber ?? connectedDevice.serialNumber
  );

  if (hotplugSerial && connectedSerial) {
    return hotplugSerial === connectedSerial;
  }

  const hotplugVendor = normalizeUsbIdentityValue(
    hotplugDevice.vendorId ?? hotplugDevice.IdVendor
  );
  const hotplugProduct = normalizeUsbIdentityValue(
    hotplugDevice.productId ?? hotplugDevice.IdProduct
  );
  const connectedVendor = normalizeUsbIdentityValue(
    connectedDevice.IdVendor ?? connectedDevice.vendorId
  );
  const connectedProduct = normalizeUsbIdentityValue(
    connectedDevice.IdProduct ?? connectedDevice.productId
  );

  return Boolean(
    hotplugVendor &&
      hotplugProduct &&
      connectedVendor &&
      connectedProduct &&
      hotplugVendor === connectedVendor &&
      hotplugProduct === connectedProduct
  );
}

export function getDeviceInfo() {
  if (IS_RENDERER) {
    // import it here so that the main process doesnt crash
    // eslint-disable-next-line global-require
    const { store } = require('../store/configureStore');
    const state = store?.getState();

    if (isEmpty(state)) {
      return {};
    }

    const info = state?.Home?.mtpDevice?.info?.mtpDeviceInfo;

    if (isEmpty(info)) {
      return {};
    }

    const {
      StandardVersion,
      MTPVersion,
      MTPExtension,
      Manufacturer,
      Model,
      DeviceVersion,
    } = info;

    return {
      StandardVersion,
      MTPVersion,
      MTPExtension,
      Manufacturer,
      Model,
      DeviceVersion,
    };
  }

  return {};
}
