/* eslint-disable no-unused-expressions */
import copy from "copy-to-clipboard";
import { URL } from "url";

export function utilRemoveSpacesAndLowercase({
  string,
}: {
  string: string;
}): string {
  let noSpaces = string.replace(/\s+/g, "");
  return noSpaces.toLowerCase();
}

export function utilParseProperty(object: any, property: string) {
  return object && object[property] ? JSON.parse(object[property]) : [];
}

import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";
import { throttle } from "lodash";
import path from "path";
import { toast } from "react-toastify";
// import { URL } from "url";

export async function utilShareLink({
  // windows,
  navigator,
  url,
}: {
  window: Window;
  navigator: Navigator;
  url: string;
}) {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Share Image",
        url,
      });
    } else {
      // Fallback for browsers that do not support navigator.share
      copy(url);
      toast.success("URL copied to clipboard");
    }
  } catch (error) {
    toast.error("Failed to share or copy URL");
  }
}
export async function utilFilesDownload1(urls: string[]): Promise<void> {
  if (urls.length === 1) {
    // If there's only one URL, download the file directly
    const urlObj = new window.URL(urls[0]);
    const filename = decodeURIComponent(
      urlObj.pathname.split("/").pop() || "file",
    );
    const response = await axios.get(urls[0], { responseType: "blob" });
    saveAs(response.data, filename);
  } else {
    // If there are multiple URLs, download them as a zip file
    const zip = new JSZip();
    const filePromises = urls.map(async (url, i) => {
      const urlObj = new window.URL(url);
      const filename = decodeURIComponent(
        urlObj.pathname.split("/").pop() || `file${i + 1}`,
      );
      const response = await axios.get(url, { responseType: "blob" });
      zip.file(filename, response.data);
    });
    await Promise.all(filePromises);
    const urlObj = new window.URL(urls[0]);
    const zipFolderName = decodeURIComponent(
      urlObj.pathname.split("/").slice(-2, -1)[0] || "files",
    );
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${zipFolderName}.zip`);
  }
}

export async function utilFilesDownload2(urls: string[]): Promise<void> {
  if (urls.length === 1) {
    // If there's only one URL, download the file directly
    const response = await fetch(urls[0]);
    const blob = await response.blob();
    const urlObject = new URL(urls[0]);
    const fileName = urlObject.pathname.split("/").pop() || "file";
    saveAs(blob, fileName);
  } else {
    // If there are multiple URLs, download them as a zip file
    const zip = new JSZip();
    const filePromises = urls.map(async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const urlObject = new URL(url);
      const fileName = urlObject.pathname.split("/").pop() || "file";
      zip.file(fileName, blob);
    });
    await Promise.all(filePromises);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const urlObject = new URL(urls[0]);
    const folderName =
      urlObject.pathname.split("/").slice(-2, -1)[0] || "files";
    saveAs(zipBlob, `${folderName}.zip`);
  }
}

export async function utilFilesDownload3(
  url: string,
  fileName: string,
): Promise<void> {
  // Fetch the image data from the URL
  const response = await fetch(url);

  // Get the image blob from the response
  const blob = await response.blob();

  // Create a temporary URL for the blob object
  const imageUrl = window.URL.createObjectURL(blob);

  // Create a link element with the download attribute and the file name
  const link = document.createElement("a");
  link.href = imageUrl;
  link.setAttribute("download", fileName ?? "/images");

  // Append the link element to the document body
  document.body.appendChild(link);

  // Click the link element to start the download
  link.click();

  // Remove the link element and clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(imageUrl);
}

export async function utilFilesDownload4({
  urls,
  setProgress,
}: {
  urls: string[];
  // eslint-disable-next-line no-unused-vars
  setProgress?: (progress: number) => void;
}): Promise<void> {
  setProgress && setProgress(0);
  if (urls.length === 1) {
    // If there's only one URL, download the file directly
    const urlObj = new window.URL(urls[0]);
    const filename = decodeURIComponent(
      urlObj.pathname.split("/").pop() || "file",
    );
    const response = await axios.get(urls[0], {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.floor(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        );
        setProgress && setProgress(percentCompleted);
      },
    });
    saveAs(response.data, filename);
    setProgress && setProgress(100);
  } else {
    // If there are multiple URLs, download them as a zip file
    const zip = new JSZip();
    const totalFiles = urls.length;
    let completedFiles = 0;

    const filePromises = urls.map(async (url, i) => {
      const urlObj = new window.URL(url);
      const filename = decodeURIComponent(
        urlObj.pathname.split("/").pop() || `file${i + 1}`,
      );
      const response = await axios.get(url, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.floor(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
          );
          const totalPercentCompleted = Math.floor(
            ((completedFiles + percentCompleted / 100) / totalFiles) * 100,
          );
          setProgress && setProgress(totalPercentCompleted);
        },
      });
      zip.file(filename, response.data);
      completedFiles++;
    });

    await Promise.all(filePromises);

    const urlObj = new window.URL(urls[0]);
    const zipFolderName = decodeURIComponent(
      urlObj.pathname.split("/").slice(-2, -1)[0] || "files",
    );
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${zipFolderName}.zip`);
    setProgress && setProgress(100);
  }
}

export async function utilFilesDownload5(urls, onProgress) {
  const zip = new JSZip();
  const totalFiles = urls.length;
  let completedFiles = 0;
  let totalSize = 0;
  let downloadedSize = 0;

  const filePromises = urls.map(async (url) => {
    const { data, size } = await utilFilesDownload5_singleFile(
      url,
      (progress, fileSize) => {
        downloadedSize += fileSize;
        const totalPercentCompleted = Math.floor(
          ((completedFiles + progress / 100) / totalFiles) * 100,
        );
        onProgress(
          totalPercentCompleted,
          downloadedSize,
          totalSize,
          completedFiles + 1,
          totalFiles,
        );
      },
    );
    totalSize += Number(size);
    const fileName = path.basename(new window.URL(url).pathname);
    const decodedName = decodeURIComponent(fileName);
    zip.file(decodedName, data);
    completedFiles++;
  });

  await Promise.all(filePromises);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return { zipBlob, totalFiles, totalSize };
}
export async function utilFilesDownload5_singleFile(
  url,
  onProgress,
  retries = 2,
) {
  try {
    const headRes = await axios.head(url);
    const totalSize = parseInt(headRes.headers["content-length"], 10);

    const response = await axios.get(url, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.floor(
          (progressEvent.loaded * 100) / totalSize,
        );
        onProgress(percentCompleted, progressEvent.loaded, totalSize, 1, 1);
      },
    });
    return { data: response.data, size: totalSize };
  } catch (error) {
    if (retries > 0) {
      return utilFilesDownload5_singleFile(url, onProgress, retries - 1);
    }
    throw error;
  }
}
export function utilFilesDownload5_images({
  images,
  zipName,
}: {
  images: string[];
  zipName?: string;
}) {
  const throttledOnProgress = throttle(
    (progress, downloadedSize, totalSize, currentFile, totalFiles) => {
      // const downloadedSizeInMB = (downloadedSize / (1024 * 1024)).toFixed(2);
      // const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      const msg = `Preparing Images: ${progress}%, ${currentFile}/${totalFiles} files)`;
      toast.update("download", { render: msg });
    },
    200,
  );

  toast.info("Download started", { toastId: "download" });

  if (images.length === 1) {
    utilFilesDownload5_singleFile(images[0], throttledOnProgress)
      .then(({ data }) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        const fileName = path.basename(new window.URL(images[0]).pathname);
        const decodedName = decodeURIComponent(fileName);
        link.setAttribute("download", decodedName);
        document.body.appendChild(link);
        link.click();
        toast.dismiss("download");
        toast.success(`Done, Please save the images`);
      })
      .catch((error) => {
        console.error("Failed to download image", error);
        toast.dismiss("download");
        toast.error("Download failed");
      });
  } else {
    utilFilesDownload5(images, throttledOnProgress)
      .then(({ zipBlob, totalFiles, totalSize }) => {
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${zipName ?? "Wicf_Images"}.zip`);
        document.body.appendChild(link);
        link.click();
        toast.dismiss("download");
        const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        toast.success(
          `Download completed (${totalFiles} files, ${totalSizeInMB} MB)`,
        );
      })
      .catch((error) => {
        console.error("Failed to download images", error);
        toast.dismiss("download");
        toast.error("Download failed");
      });
  }
}
