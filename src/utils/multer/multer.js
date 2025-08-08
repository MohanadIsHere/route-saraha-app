import multer from "multer";

export const localFileUpload = ({ acceptedPaths = [] } = {}) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./upload");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (acceptedPaths.length === 0) {
      cb(null, true);
    }

    if (acceptedPaths.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Only ${acceptedPaths.join(", ")} files are allowed but received ${
            file.mimetype
          }`
        ),
        false
      );
    }
  };

  return multer({
    dest: "./tmp",
    fileFilter,
    storage,
  });
};
export const onlineFileUpload = ({ acceptedPaths = [] } = {}) => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (acceptedPaths.length === 0) {
      cb(new Error("No file types allowed"), false);
    }

    if (acceptedPaths.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Only ${acceptedPaths.join(", ")} files are allowed but received ${
            file.mimetype
          }`
        ),
        false
      );
    }
  };

  return multer({
    fileFilter,
    storage,
  });
};
