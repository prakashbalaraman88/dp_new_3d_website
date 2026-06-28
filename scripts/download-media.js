import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mediaUrls = {
  videos: [
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/video/upload/v1731918094/Extended_Video_chr2_thf4_1_hcihkv.mp4',
      filename: 'hero-video.mp4'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/video/upload/v1732012805/My_Video-2_jdcz1p.mp4',
      filename: 'project-1.mp4'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/video/upload/v1732026143/Project_2_wmdzro.mp4',
      filename: 'project-2.mp4'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/video/upload/v1732095987/My_Video-3_yqnjmi.mp4',
      filename: 'project-3.mp4'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/video/upload/v1732178096/Final_Video_lkgkwx.mp4',
      filename: 'project-4.mp4'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/video/upload/v1732187901/My_Video-4_chr2_thf4_gp008w.mp4',
      filename: 'project-5.mp4'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/video/upload/v1732190171/My_Video-5_chr2_thf4_2_qkmcno.mp4',
      filename: 'project-6.mp4'
    }
  ],
  images: [
    // Team images
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732346821/IMG-20170603-WA0006-gigapixel-redefine-2x_2_w7auma.png',
      filename: 'team-kishan.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732346821/Kuruoanka-p7o8t8j5nii7ofgakaimhph2yoi12wheeglvvilwuw-gigapixel-redefine-2x-faceai_v2_g2drvp.png',
      filename: 'team-krupanka.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732347365/Prashanth-1.jpg-gigapixel-redefine-2x-faceai_v2_kimauv.png',
      filename: 'team-prashanth.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732348130/IMG-20170603-WA0049-gigapixel-redefine-2x-faceai_v2_dmeyg7.png',
      filename: 'team-ashwini.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732353274/WhatsApp_Image_2024-11-23_at_2.17.11_PM-gigapixel-redefine-1x_1_-min_jezdz7.png',
      filename: 'team-nithin.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732370272/DSC_4047_rt9cxn.jpg',
      filename: 'team-adarsh.jpg'
    },
    // Project images
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732009700/photorealistic-3d-render-of-a-master-bedroom-tv-un-gigapixel-redefine-2x-min_y0buv3.png',
      filename: 'project-1.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/q_10,w_50,e_blur:1000/v1732009700/photorealistic-3d-render-of-a-master-bedroom-tv-un-gigapixel-redefine-2x-min_y0buv3.png',
      filename: 'project-1-thumbnail.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732026139/ultra-realistic-3d-render-of-a-sophisticated-famil-gigapixel-redefine-2x-min_oz7kit.png',
      filename: 'project-2.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/q_10,w_50,e_blur:1000/v1732026139/ultra-realistic-3d-render-of-a-sophisticated-famil-gigapixel-redefine-2x-min_oz7kit.png',
      filename: 'project-2-thumbnail.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732095921/photorealistic-render-of-a-luxury-guest-suite-comb-gigapixel-redefine-2x-min_njrv03.png',
      filename: 'project-3.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/q_10,w_50,e_blur:1000/v1732095921/photorealistic-render-of-a-luxury-guest-suite-comb-gigapixel-redefine-2x-min_njrv03.png',
      filename: 'project-3-thumbnail.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732178178/ultra-realistic-3d-render-of-a-contemporary-three--gigapixel-redefine-2x-min_skv3n4.png',
      filename: 'project-4.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/q_10,w_50,e_blur:1000/v1732178178/ultra-realistic-3d-render-of-a-contemporary-three--gigapixel-redefine-2x-min_skv3n4.png',
      filename: 'project-4-thumbnail.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732187966/ultra-realistic-3d-render-of-a-contemporary-three--gigapixel-redefine-2x-min_na1lrt.png',
      filename: 'project-5.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/q_10,w_50,e_blur:1000/v1732187966/ultra-realistic-3d-render-of-a-contemporary-three--gigapixel-redefine-2x-min_na1lrt.png',
      filename: 'project-5-thumbnail.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732190226/photorealistic-3d-render-of-a-sophisticated-1600-s-gigapixel-redefine-2x-min-min_l5abwq.png',
      filename: 'project-6.png'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/q_10,w_50,e_blur:1000/v1732190226/photorealistic-3d-render-of-a-sophisticated-1600-s-gigapixel-redefine-2x-min-min_l5abwq.png',
      filename: 'project-6-thumbnail.png'
    },
    // Hero images
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1732353275/a-black-and-white-pecil-sketch-of-a-beautiful-mode-gigapixel-redefine-2x-min_envnte.png',
      filename: 'poster-image.jpg'
    },
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/q_10,w_50,e_blur:1000/v1732353275/a-black-and-white-pecil-sketch-of-a-beautiful-mode-gigapixel-redefine-2x-min_envnte.png',
      filename: 'thumbnail-image.jpg'
    },
    // Illustrated Section image
    {
      url: 'https://res.cloudinary.com/dnu3ijmha/image/upload/v1731937808/hyper-realistic-3d-render-of-a-cutting-edge-kitche-gigapixel-redefine-2x-min_rzpidu.png',
      filename: 'illustrated-kitchen.png'
    }
  ]
};

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destination}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(destination, () => {});
      reject(err);
    });
  });
}

async function downloadAllMedia() {
  const baseDir = path.join(__dirname, '..', 'public', 'assets');
  
  // Download videos
  for (const video of mediaUrls.videos) {
    const destination = path.join(baseDir, 'videos', video.filename);
    await downloadFile(video.url, destination);
  }
  
  // Download images
  for (const image of mediaUrls.images) {
    const destination = path.join(baseDir, 'images', image.filename);
    await downloadFile(image.url, destination);
  }
}

downloadAllMedia().catch(console.error);
