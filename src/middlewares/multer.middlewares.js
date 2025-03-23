// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })
  
// export const upload = multer({ 
//     storage,
//     limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
// })


import multer from "multer";
import uploadOnCloudinary from "../utils/cloudinary.js"; 

// Use memory storage (avoids persistent storage issues on Vercel)
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

// Middleware to handle file uploads and Cloudinary processing
export const uploadAndProcess = (fields) => {
  return async (req, res, next) => {
      upload.fields(fields)(req, res, async (err) => {
          if (err) {
              return res.status(400).json({ error: err.message });
          }

          try {
              if (!req.files || Object.keys(req.files).length === 0) {
                  return res.status(400).json({ error: "No file uploaded" }); // ✅ Additional check
              }

              for (const fieldName in req.files) {
                  req.files[fieldName] = await Promise.all(
                      req.files[fieldName].map(async (file) => {
                          const result = await uploadOnCloudinary(file.buffer);
                          return result; // ✅ Returns URL instead of an object
                      })
                  );
              }

              next();
          } catch (error) {
              return res.status(500).json({ error: "Error uploading to Cloudinary" });
          }
      });
  };
};

