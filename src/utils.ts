import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
// Helper function to send a message with a keyboard
export function UT_sendKeyboardMessage(
  bot: TelegramBot,
  chatId: number,
  text: string,
  keyboard: any
) {
  const options: TelegramBot.SendMessageOptions = {
    parse_mode: 'Markdown',
    reply_markup: {
      one_time_keyboard: true,
      keyboard,
    },
  };
  bot.sendMessage(chatId, text, options);
}

export function removeExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, '');
}

export const uploadFileToMediaServer = async (file: Buffer | undefined, type: string) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Convert Buffer to Blob
    const blob = new Blob([file], { type });

    // Create FormData object and append file to it
    const formData = new FormData();
    formData.append('file', blob);

    console.log(formData);

    const values = { email: 'denkluch88@gmail.com', password: 'lublukiski777' };
    const signInUrl = 'https://snakicz-bot.net/cloud/store/auth/signin';
    const uploadUrl = 'https://snakicz-bot.net/cloud/store/files/uploadFile';

    try {
      // Authenticate user
      const jwtToken = (await axios.post(signInUrl, values)).data;

      // Upload file
      const uploadResponse = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      // Send response
      return {
        url: `https://snakicz-bot.net/cloud/store/uploads/den4ik/${uploadResponse.data.fileName}`,
      };
    } catch (error) {
      console.log(error);
      throw new Error('An error occurred while uploading the file.');
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while processing the file.');
  }
};

async function downloadFile(url: string, path: string) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream', // set responseType to stream
  });

  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      resolve(path); // Resolve with the full destination path
    });

    writer.on('error', (err: any) => {
      reject(err);
    });
  });
}

// Function to delete the file
function deleteFile(filePath: string) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log('File deleted successfully:', filePath);
    }
  });
}

export async function uploadAndDeleteFile(fileUrl: string, destinationPath: string, type: string) {
  const folderPath = path.resolve(__dirname, '../../temp');

  // Check if the directory exists
  if (!fs.existsSync(folderPath)) {
    // If it doesn't exist, create the directory
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Create the full destination path by combining folderPath and destination
  const fullDestination = path.join(folderPath, destinationPath);

  return downloadFile(fileUrl, fullDestination)
    .then(async () => {
      console.log('File downloaded successfully:', fileUrl);
      const fileContent = fs.readFileSync(fullDestination);

      // Call the function to process the downloaded file
      return (await uploadFileToMediaServer(fileContent, type)).url;
    })
    .catch((error) => {
      console.error('Error downloading file:', error);
    })
    .finally(() => {
      // Delete the file after processing
      deleteFile(fullDestination);
    });
}
