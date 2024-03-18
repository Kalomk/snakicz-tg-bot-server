import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import axios from 'axios';
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

export const uploadFileToMediaServer = async (file: Buffer | undefined) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Convert Buffer to Blob
    const blob = new Blob([file], { type: 'image/jpeg' });

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
        imgUrl: `https://snakicz-bot.net/cloud/store/uploads/den4ik/${uploadResponse.data.fileName}`,
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

async function downloadFile(url: string, destination: string) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer', // set responseType to arraybuffer
  });

  const buffer = Buffer.from(response.data); // Convert response data to Buffer

  // Write the Buffer to the destination file
  fs.writeFileSync(destination, buffer);

  return new Promise((resolve, reject) => {
    response.data.on('end', (data: any) => {
      resolve(data);
    });

    response.data.on('error', (err: any) => {
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

export async function uploadAndDeleteFile(fileUrl: string, destinationPath: string) {
  return downloadFile(fileUrl, destinationPath)
    .then(async () => {
      console.log('File downloaded successfully:', fileUrl);
      const fileContent = fs.readFileSync(destinationPath);

      // Call the function to process the downloaded file
      return (await uploadFileToMediaServer(fileContent)).imgUrl;
    })
    .catch((error) => {
      console.error('Error downloading file:', error);
    })
    .finally(() => {
      // Delete the file after processing
      deleteFile(fileUrl);
    });
}
