// document.addEventListener("DOMContentLoaded", () => {

//     const fileInput = document.getElementById("fileInput");
//     const detectBtn = document.getElementById("detectBtn");
//     const uploadImg = document.getElementById("uploadImg");
//     const resultImg = document.getElementById("resultImg");
//     const status = document.getElementById("status");
//     const count = document.getElementById("count");

//     let selectedFile = null;

//     fileInput.addEventListener("change", () => {
//         selectedFile = fileInput.files[0];
//         if (!selectedFile) return;

//         uploadImg.src = URL.createObjectURL(selectedFile);
//         resultImg.src = ""; // clear old result
//         status.innerText = "Ready";
//         count.innerText = "0";
//     });

//     detectBtn.addEventListener("click", async (e) => {
//     e.preventDefault();

//     if (!selectedFile) {
//         alert("Select an image first");
//         return;
//     }


//         status.innerText = "Processing...";

//         const formData = new FormData();
//         formData.append("file", selectedFile);

//         const res = await fetch("http://127.0.0.1:8000/detect", {
//             method: "POST",
//             body: formData
//         });

//         const data = await res.json();

//         resultImg.src =
//             "http://127.0.0.1:8000" + data.image_url + "?t=" + Date.now();

//         count.innerText = data.potholes_detected;
//         status.innerText = "Completed";
//     });

// });



document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const detectBtn = document.getElementById("detectBtn");
    const uploadImg = document.getElementById("uploadImg");
    const resultImg = document.getElementById("resultImg");
    const status = document.getElementById("status");
    const count = document.getElementById("count");

    let selectedFile = null;

    fileInput.addEventListener("change", () => {
        selectedFile = fileInput.files[0];
        if (!selectedFile) return;

        uploadImg.src = URL.createObjectURL(selectedFile);
        resultImg.src = ""; 
        status.innerText = "Ready";
        count.innerText = "0";
    });

    detectBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Select an image first");
            return;
        }

        status.innerText = "Processing...";

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await fetch("http://127.0.0.1:8000/detect", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Backend Error");

            const data = await res.json();

            // Set up the load listener BEFORE setting the src
            resultImg.onload = () => {
                status.innerText = "Completed";
            };

            // Added a unique timestamp to force the browser to ignore cache
            const timestamp = new Date().getTime();
            resultImg.src = `http://127.0.0.1:8000${data.image_url}?t=${timestamp}`;

            count.innerText = data.potholes_detected;

        } catch (error) {
            console.error(error);
            status.innerText = "Error during detection";
        }
    });
});