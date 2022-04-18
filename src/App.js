import React from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

import logo from "./logo.svg";

function App() {
  const cropper = React.createRef();
  const [mode, setMode] = React.useState("edit");
  const [originAvatar, setOriginAvatar] = React.useState(null);
  const [originImgSrc, setOriginImgSrc] = React.useState("");
  const [avatar, setAvatar] = React.useState(null);
  const [imgSrc, setImgSrc] = React.useState("");

  function handleReaderImage(e) {
    const reader = e.target;
    setImgSrc(reader.result);
    setOriginImgSrc(reader.result);
  }

  function handleChangeImage(e) {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = handleReaderImage.bind(this);
      reader.readAsDataURL(file);
      setAvatar(file);
      setOriginAvatar(file);
    }
  }

  function cropImage(res) {
    const imgSrc = URL.createObjectURL(res);
    setAvatar(res);
    setImgSrc(imgSrc);
  }

  function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
  }

  function saveBlobCrop() {
    const canvas = cropper.current.getCroppedCanvas();
    if (canvas) {
      const res = dataURItoBlob(canvas.toDataURL());
      cropImage(res);
    }
  }

  function saveBlobRotate() {
    cropper.current.rotate(90);
    saveBlobCrop();
  }

  function getCursorPos(e) {
    let imgOrigin = document.getElementById("image-original");
    var a,
      x = 0,
      y = 0;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = imgOrigin.getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y };
  }

  function moveLens(e) {
    let imgOrigin = document.getElementById("image-original");
    let imgZoom = document.getElementById("image-zoom");
    let lensZoom = document.getElementById("lens-zoom");
    /*calculate the ratio between result DIV and lens:*/
    let rsx = imgZoom.offsetWidth / lensZoom.offsetWidth;
    let rsy = imgZoom.offsetHeight / lensZoom.offsetHeight;
    var pos, x, y;
    /*prevent any other actions that may occur when moving over the image:*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = getCursorPos(e);
    /*calculate the position of the lens:*/
    x = pos.x - lensZoom.offsetWidth / 2;
    y = pos.y - lensZoom.offsetHeight / 2;
    /*prevent the lens from being positioned outside the image:*/
    if (x > imgOrigin.width - lensZoom.offsetWidth) {
      x = imgOrigin.width - lensZoom.offsetWidth;
    }
    if (x < 0) {
      x = 0;
    }
    if (y > imgOrigin.height - lensZoom.offsetHeight) {
      y = imgOrigin.height - lensZoom.offsetHeight;
    }
    if (y < 0) {
      y = 0;
    }
    /*set the position of the lens:*/
    lensZoom.style.left = x + "px";
    lensZoom.style.top = y + "px";
    /*display what the lens "sees":*/
    imgZoom.style.backgroundPosition = "-" + x * rsx + "px -" + y * rsy + "px";
  }

  function handleShowZoom() {
    let imgOrigin = document.getElementById("image-original");
    let imgZoom = document.getElementById("image-zoom");
    let lensZoom = document.getElementById("lens-zoom");
    if (!lensZoom) {
      /*create lens:*/
      lensZoom = document.createElement("div");
      lensZoom.id = "lens-zoom";
      /*insert lens:*/
      imgOrigin.parentElement.insertBefore(lensZoom, imgOrigin);
      lensZoom.style.position = "absolute";
      lensZoom.style.border = "1px solid #fff";
      lensZoom.style.width = "80px";
      lensZoom.style.height = "80px";
    }
    /*calculate the ratio between result DIV and lens:*/
    let rsx = imgZoom.offsetWidth / lensZoom.offsetWidth;
    let rsy = imgZoom.offsetHeight / lensZoom.offsetHeight;
    /*set background properties for the result DIV:*/
    imgZoom.style.backgroundImage = `url('${originImgSrc}')`;
    imgZoom.style.backgroundSize = `${imgOrigin.width *
      rsx}px ${imgOrigin.height * rsy}px`;
    imgZoom.style.opacity = 1;
    /*execute a function when someone moves the cursor over the image, or the lens:*/
    lensZoom.addEventListener("mousemove", moveLens);
    imgOrigin.addEventListener("mousemove", moveLens);
    /*and also for touch screens:*/
    lensZoom.addEventListener("touchmove", moveLens);
    imgOrigin.addEventListener("touchmove", moveLens);
  }

  function handleHiddenZoom() {
    console.log("run");
    let imgOrigin = document.getElementById("image-original");
    let imgZoom = document.getElementById("image-zoom");
    let lensZoom = document.getElementById("lens-zoom");
    if (lensZoom) {
      lensZoom.removeEventListener("mousemove", moveLens);
      lensZoom.removeEventListener("touchmove", moveLens);
      lensZoom.remove();
    }
    imgOrigin.removeEventListener("mousemove", moveLens);
    imgOrigin.removeEventListener("touchmove", moveLens);
    imgZoom.style.backgroundImage = "";
    imgZoom.style.opacity = 0;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgb(74, 173, 244)",
        width: "100vw",
        height: "100vh"
      }}
    >
      <img
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          marginBottom: "20px"
        }}
        src={imgSrc && imgSrc !== "" ? imgSrc : logo}
        alt=""
      />
      <input
        style={{ width: "75px", marginBottom: "10px" }}
        type="file"
        accept="image/*"
        onChange={handleChangeImage}
      />
      <div
        style={{
          fontSize: "13px",
          color: "#fff",
          height: "20px",
          marginBottom: "20px"
        }}
      >
        {avatar && avatar.name}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ fontSize: "13px", color: "#fff", marginRight: "10px" }}
          onClick={() => setMode("edit")}
        >
          <input
            type="radio"
            value="edit"
            checked={mode === "edit"}
            onChange={() => setMode("edit")}
          />{" "}
          Edit
        </label>
        <label
          style={{ fontSize: "13px", color: "#fff", marginLeft: "10px" }}
          onClick={() => setMode("zoom")}
        >
          <input
            type="radio"
            value="zoom"
            checked={mode === "zoom"}
            onChange={() => setMode("edit")}
          />{" "}
          Zoom
        </label>
      </div>
      {mode === "edit" && (
        <React.Fragment>
          <Cropper
            style={{
              width: "400px",
              height: "400px",
              maxWidth: "400px",
              maxHeight: "400px"
            }}
            ref={cropper}
            src={originImgSrc}
            aspectRatio={1}
            guides={false}
            background={false}
            zoomable={false}
            scalable={false}
            movable={false}
          />
          {originAvatar && (
            <div
              style={{
                width: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <button
                style={{
                  marginTop: "20px",
                  padding: "10px 30px",
                  backgroundColor: "#0f9b0f",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "5px"
                }}
                onClick={saveBlobRotate}
              >
                ROTATE
              </button>
              <button
                style={{
                  marginTop: "20px",
                  padding: "10px 30px",
                  backgroundColor: "#EF3B36",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "5px"
                }}
                onClick={saveBlobCrop}
              >
                CROP
              </button>
            </div>
          )}
        </React.Fragment>
      )}
      {mode === "zoom" && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{ position: "relative" }}
            onMouseOver={handleShowZoom}
            onMouseLeave={handleHiddenZoom}
          >
            <img
              id="image-original"
              style={{
                width: "400px",
                height: "400px",
                maxWidth: "400px",
                maxHeight: "400px",
                marginRight: "20px"
              }}
              src={originImgSrc}
              alt=""
            />
          </div>
          <div
            id="image-zoom"
            style={{
              width: "400px",
              height: "400px",
              maxWidth: "400px",
              maxHeight: "400px",
              opacity: 0,
              transition: "opacity 0.5s ease-in-out"
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
