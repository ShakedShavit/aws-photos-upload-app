import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import './App.css';

const url = 'http://localhost:5000';
// const S3URL = 'https://photos-storage-shavit.s3-eu-west-1.amazonaws.com/';
const imageUrl = 'http://localhost:5000/get-image/';

function App() {
  const [images, setImages] = useState([]);

  useEffect(async () => {
    try {
      const res = await Axios.get(url + '/get-all-images');
      setImages([...res.data]);
    } catch(err) {
      console.log(err);
    }
  }, []);

  const uploadImage = async (e) => {
    e.preventDefault();
    let fd = new FormData(e.target);
    try {
      const res = await Axios.post(url + '/post-image', fd, {
        headers: {
          'content-type': 'multipart/form-data'
        },
      });

      setImages([...images, res.data]);
    } catch(err) {
      console.log(err);
    }
  }

  const deleteImage = async (id, key, index) => {
    try {
      const res = await Axios.delete(url + '/delete-image', { data: { id, key } });
      let tempImgArr = [...images];
      tempImgArr.splice(index, 1);
      setImages([...tempImgArr]);
    } catch(err) {
      console.log(err);
    }
  }

  return (
    <div className="App">
      <form onSubmit={uploadImage}>
        <input type="file" name="image" accept="image/*"></input>
        <button type="submit">upload image</button>
      </form>
      {
        images.map((image, index) => {
          return (
            <div key={image._id}>
              <img src={imageUrl + `?key=${image.key}&name=${image.originalName}`} alt={image.originalName}></img>
              <button onClick={() => { deleteImage(image._id, image.key, index) }}>delete image</button>
            </div>
          )
        })
      }
    </div>
  );
}

export default App;
