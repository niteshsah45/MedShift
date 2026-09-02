import multer from "multer";

const storage = multer.memoryStorage();

// const upload = multer({
//     storage,

//     limits: {
//         fileSize: 5 * 1024 * 1024
//     },

//     fileFilter: (req, file, cb) => {

//         const allowedTypes = [
//             "image/jpeg",
//             "image/png",
//             "application/pdf"
//         ];

//         if (!allowedTypes.includes(file.mimetype)) {
//             return cb(
//                 new Error(
//                     "Only JPG, PNG and PDF files are allowed"
//                 )
//             );
//         }

//         cb(null, true);
//     }
// });

// export default upload;

const  upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/octet-stream"
        ];

        const allowedExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".pdf"
        ];

        const extension =
            "." +
            file.originalname
                .split(".")
                .pop()
                .toLowerCase();

        if (
            allowedMimeTypes.includes(file.mimetype) &&
            allowedExtensions.includes(extension)
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, PNG and PDF files are allowed"
                )
            );
        }
    }
});

export default upload;