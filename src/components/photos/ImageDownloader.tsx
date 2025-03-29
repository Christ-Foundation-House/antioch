import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// toast.configure({});

function throttleFunction(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

function formatFileSize(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function updateToast(
  toastId,
  progress,
  downloadedSize,
  totalSize,
  currentFile,
  totalFiles,
) {
  toast.update(toastId, {
    render: `Download progress: ${progress}% (${formatFileSize(
      downloadedSize,
    )}/${formatFileSize(totalSize)} MB, ${currentFile}/${totalFiles} files)`,
    autoClose: false,
  });
}

function displayToast(type, message) {
  if (type === "info") {
    toast.info(message);
  } else if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  }
}

async function downloadImage(url, onProgress) {
  const response = await axios.get(url, {
    responseType: "blob",
    onDownloadProgress: (progressEvent) => {
      const percentCompleted = Math.floor(
        (progressEvent.loaded * 100) / (progressEvent.total ?? 0),
      );
      onProgress(percentCompleted, progressEvent.loaded);
    },
  });
  return { data: response.data, size: response.headers["content-length"] };
}

async function downloadImages(urls, onProgress) {
  const totalFiles = urls.length;
  let completedFiles = 0;
  let totalSize = 0;
  let downloadedSize = 0;

  const filePromises = urls.map(async (url) => {
    const { data, size } = await downloadImage(url, (progress, fileSize) => {
      downloadedSize += fileSize;
      totalSize += Number(size);
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
    });
    completedFiles++;
    return data;
  });

  return Promise.all(filePromises);
}

function ImageDownloader({ images }) {
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const throttledOnProgress = throttleFunction(updateToast, 200);
    const toastId = toast("Download started", { autoClose: false });

    downloadImages(
      images,
      (progress, downloadedSize, totalSize, currentFile, totalFiles) => {
        setDownloadProgress(progress);
        throttledOnProgress(
          toastId,
          progress,
          downloadedSize,
          totalSize,
          currentFile,
          totalFiles,
        );
      },
    )
      .then(() => {
        toast.dismiss(toastId);
        displayToast("success", "Download completed");
      })
      .catch((error) => {
        console.error(error);
        toast.dismiss(toastId);
        displayToast("error", "Download failed");
      });
  }, [images]);

  return (
    <div>
      <p>Download progress: {downloadProgress}%</p>
      <button
      // onClick={() =>
      //   downloadImages(
      //     images,
      //     (progress, downloadedSize, totalSize, currentFile, totalFiles) => { }
      //   )
      // }
      >
        Download Images
      </button>
    </div>
  );
}

export default ImageDownloader;
