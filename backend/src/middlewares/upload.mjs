import multer from "multer";
import path from "path";
import fs from "fs";

const policyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/policy");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, new Date().getTime() + "-" + fileName);
  },
});

const uploadPolicy = multer({ storage: policyStorage });

const removePolicyImage = (directory, filename) => {
  const filePath = `${directory}/${filename}`;

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return;

    fs.unlink(filePath, (err) => {
      if (err) return;
    });
  });
};

export { uploadPolicy, removePolicyImage };
