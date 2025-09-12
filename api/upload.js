import { Formidable } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new Formidable();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to parse form data.' });
    }

    const file = files.resume[0];

    // You can now process the file. For example, read its content.
    // For now, we'll just send a success message.
    console.log(`Received file: ${file.originalFilename}`);

    res.status(200).json({
      response: `Your resume, "${file.originalFilename}", has been successfully uploaded.`
    });
  });
}
