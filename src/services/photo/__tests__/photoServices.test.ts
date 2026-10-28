import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  requestCameraPermissions,
  takeMeterPhoto,
} from '../cameraService';
import {
  persistPhoto,
  deletePhoto,
  ensurePhotosDirectoryExists,
} from '../photoStorageService';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  getCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock-app-dir/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

describe('Photo Services (cameraService & photoStorageService)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cameraService', () => {
    it('requests camera permission and returns true when granted', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
      });

      const granted = await requestCameraPermissions();
      expect(granted).toBe(true);
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false when camera permission is denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.DENIED,
      });

      const granted = await requestCameraPermissions();
      expect(granted).toBe(false);
    });

    it('takes meter photo with 0.7 compression and returns image URI', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///temp/camera_shot.jpg' }],
      });

      const uri = await takeMeterPhoto();
      expect(uri).toBe('file:///temp/camera_shot.jpg');
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });
    });

    it('returns null when camera capture is canceled by user', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: null,
      });

      const uri = await takeMeterPhoto();
      expect(uri).toBeNull();
    });
  });

  describe('photoStorageService', () => {
    it('ensures photo directory exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

      await ensurePhotosDirectoryExists();

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        'file:///mock-app-dir/epmaps_photos/',
        { intermediates: true }
      );
    });

    it('persists photo to permanent directory with sanitized name', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);

      const permUri = await persistPhoto('file:///temp/raw.jpg', 'MED-123456');

      expect(permUri).toContain('file:///mock-app-dir/epmaps_photos/MED-123456_');
      expect(FileSystem.copyAsync).toHaveBeenCalledWith({
        from: 'file:///temp/raw.jpg',
        to: permUri,
      });
    });

    it('deletes photo when it exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      await deletePhoto('file:///mock-app-dir/epmaps_photos/photo1.jpg');

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        'file:///mock-app-dir/epmaps_photos/photo1.jpg',
        { idempotent: true }
      );
    });

    it('does nothing when deleting null or non-existent photo', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

      await deletePhoto(null);
      await deletePhoto('file:///non-existent.jpg');

      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
