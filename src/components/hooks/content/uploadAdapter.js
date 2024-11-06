import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase";

class UploadAdapter {
  constructor(loader, productId) {
    this.loader = loader;
    this.productId = productId;
  }

  async upload() {
    try {
      const file = await this.loader.file;

      const storageRef = ref(
        storage,
        `editor-images/${this.productId}/${file.name}`
      );

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        default: downloadURL,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  abort() {
    return false;
  }
}

export default UploadAdapter;
