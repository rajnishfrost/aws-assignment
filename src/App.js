import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loader , setLoader] = useState(false);

  useEffect(() => {
    fetchRecentFiles();
  }, []);


  const fetchRecentFiles = async () => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      region: process.env.REACT_APP_AWS_DEFAULT_REGION
    });

    const cutoffDate = new Date(); 
    cutoffDate.setDate(cutoffDate.getDate() - 1);

    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET,
    };

    try {
      const data = await s3.listObjectsV2(params).promise();
        const files = data.Contents.filter(file => file.LastModified > cutoffDate);
        files.sort((a, b) => b.LastModified - a.LastModified);
        const recentFiles = files.slice(0, 10);
        setRecentFiles(recentFiles);
    } catch (error) {
      console.error('Error fetching recent files:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if(selectedFile?.length === 0 || selectedFile === null)
      return
    setLoader(true);
    const s3 = new AWS.S3({
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      region: process.env.REACT_APP_AWS_DEFAULT_REGION
    });

    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET,
      Key: selectedFile.name,
      Body: selectedFile
    };

    try {
       await s3.upload(params).promise();
       setLoader(false);
       document.getElementById('file-input').value = ''
      console.log('File uploaded successfully');
      fetchRecentFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
console.log(selectedFile);
  return (
    <div>
      <h2>Upload File</h2>
      <input id='file-input' type="file" onChange={handleFileChange} />
      {
        loader ? 
        <span class="loader"></span>
        :
      <button onClick={uploadFile}>Upload</button>
      }
      <h2>Recent Files</h2>
      <ul>
        {recentFiles.map((file, index) => (
          <li key={index}>
            {file.Key} - {file.LastModified.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
