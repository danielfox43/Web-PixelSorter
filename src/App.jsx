 import { useState } from 'react';
import './App.css';

function App() {
  const [imageData, setImageData] = useState(null);
  const [final, setFinal] = useState(null);
  const [type, setTipe] = useState(4);
  const [threshold, setThreshold] = useState(100);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setImageData(imageData.data); // RGBA array
        console.log(imageData.data.length)
        const div = [];
        console.time('execution time:')
        for (let i = 0; i < imageData.data.length; i += (img.width * type)) {
          div.push([])
          const row = imageData.data.slice(i, i + (img.width * type))
          for (let x = 0; x < row.length; x+=type) {
            div[i / (img.width * type)].push([
              row[x],
              row[x+1],
              row[x+2],
              row[x+3]
            ])
            
          }
          console.log()
        }
        setFinal(div)
        console.timeEnd('execution time:')
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  const fe = () => { 
    if (final) {
      console.time('sorting...')
      for (let y = 0; y < final.length; y++) {
        let finish = 0;
        for (let x = 0; x < final[y].length; x++) { // Accessing final[y] dynamically
          let r = final[y][x][0];
          let g = final[y][x][1];
          let b = final[y][x][2];
          
          // Check brightness
          if (Math.ceil((r + g + b) / 3) >= threshold) {
            finish += 1;
          } else {
            if (finish > 0) {
              const sliceStart = x - finish;
              const sliceEnd = x;
  
              // Ensure valid slice indices
              if (sliceStart >= 0 && sliceEnd <= final[y].length) {
                const segment = final[y].slice(sliceStart, sliceEnd);
                const sortedSegment = segment.sort((a, b) => {
                  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
                });
  
                // Remove the unsorted segment
                final[y].splice(sliceStart, finish);
  
                // Insert the sorted segment
                final[y].splice(sliceStart, 0, ...sortedSegment);
              }
              finish = 0; // Reset finish counter
            }
          }
        }
      }
      console.timeEnd('sorting...')
      console.log("Processing complete", final);
    }
  };
  
  const re = () => {
    if(final || final > 0){
      const back = []
    console.time('reconstruct...')
    for (let y = 0; y < final.length; y++) {
      for (let x = 0; x < final[y].length; x++) {
        back.push(...final[y][x])
      }
      
    }
    console.timeEnd('reconstruct...')
    console.time('extra')
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Assuming the image is the same size as the original
    const width = final[0].length;
    const height = final.length;
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
    
    
    const newImageData = new ImageData(new Uint8ClampedArray(back), width, height);
    
    ctx.putImageData(newImageData, 0,0,)


  
    // Convert the canvas to a data URL and display the image
    const url = canvas.toDataURL()
    document.getElementById('screen').src = url
    console.timeEnd('extra')
  } else {
    console.log("no file")
  }
  }
  function setThr(e) {
    setThreshold(e.target.value);
  }
  return (
    <>
      <input type="file" id="img" onChange={handleImageUpload} />
      <div>
      <input type='range' min={0} max={255} onChange={(e) => setThr(e)}></input>
      <p>{threshold}</p>
      </div>
      <button onClick={fe}>Process Image</button>
      <button onClick={re}>Reset array</button>
      <img id='screen' alt="Uploaded" />
    </>
  );
}

export default App;