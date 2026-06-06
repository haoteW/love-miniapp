function getExt(filePath) {
  const match = /\.([^.?#]+)(?:[?#].*)?$/.exec(filePath);
  return match ? match[1] : 'jpg';
}

function uploadImage(filePath, folder = 'diaries') {
  if (!wx.cloud) return Promise.resolve(filePath);

  const ext = getExt(filePath);
  const cloudPath = `${folder}/${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;

  return wx.cloud.uploadFile({
    cloudPath,
    filePath
  }).then((res) => res.fileID).catch((error) => {
    console.warn('图片上传失败，保留本地临时路径', error);
    return filePath;
  });
}

function uploadImages(filePaths, folder) {
  return Promise.all((filePaths || []).map((filePath) => uploadImage(filePath, folder)));
}

module.exports = {
  uploadImage,
  uploadImages
};
