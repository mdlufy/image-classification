let model = undefined;
const modelName = "mobilenet";

async function loadModel() {
    console.log("model loading..");

    const loader = document.getElementById("progress-box");
    const load_button = document.getElementById("load-button");
    loader.style.display = "block";

    model = await tf.loadLayersModel("./output/mobilenet/model.json");

    loader.style.display = "none";

    load_button.disabled = true;
    load_button.innerHTML = "Модель загружена";
    load_button.style.backgroundColor = 'green';
    load_button.style.borderColor = 'green';

    console.log("model loaded..");
}

async function loadFile() {
    console.log("image is in loadfile..");

    document.getElementById("select-file-box").style.display = "table-cell";
    document.getElementById("predict-box").style.display = "table-cell";
    document.getElementById("prediction").innerHTML = "Нажмите 'Классифицировать' для получения прогноза";

    const fileInputElement = document.getElementById("select-file-image");

    console.log(fileInputElement.files[0]);

    renderImage(fileInputElement.files[0]);
}

function renderImage(file) {
    const reader = new FileReader();

    console.log("image is here..");

    reader.onload = function (event) {
        img_url = event.target.result;

        console.log("image is here2..");

        document.getElementById("test-image").src = img_url;

        const loadFileLabel = document.getElementById("select-image-label");
        loadFileLabel.style.backgroundColor = 'green';
        loadFileLabel.style.borderColor = 'green';
    };

    reader.readAsDataURL(file);
}

async function predButton() {
    console.log("model loading..");

    if (!model) {
        alert("Вначале загрузите модель");
    }
    if (document.getElementById("predict-box").style.display == "none") {
        alert(`"Загрузите изображение, используя кнопку "Демо-изображение" или "Загрузить изображение"`);
    }

    console.log(model);

    let image = document.getElementById("test-image");
    let tensor = preprocessImage(image, modelName);

    let predictions = await model.predict(tensor).data();

    let results = Array.from(predictions)
        .map(function (p, i) {
            return {
                probability: p,
                className: IMAGENET_CLASSES[i],
            };
        })
        .sort(function (a, b) {
            return b.probability - a.probability;
        })
        .slice(0, 5);

    document.getElementById("predict-box").style.display = "block";
    document.getElementById("prediction").innerHTML =
        "Прогноз <br><b>" + results[0].className + "</b>";

    const ul = document.getElementById("predict-list");
    ul.innerHTML = "";

    results.forEach((p) => {
        console.log(p.className + " " + p.probability.toFixed(5));

        const li = document.createElement("LI");

        li.innerHTML = p.className + " " + p.probability.toFixed(5) + "..";

        ul.appendChild(li);
    });
}

function preprocessImage(image, modelName) {
    let tensor = tf.browser
        .fromPixels(image)
        .resizeNearestNeighbor([224, 224])
        .toFloat();

    if (modelName === undefined) {
        return tensor.expandDims();
    } else if (modelName === "mobilenet") {
        let offset = tf.scalar(127.5);
        return tensor.sub(offset).div(offset).expandDims();
    } else {
        alert("Unknown model name..");
    }
}

function loadDemoImage() {
    document.getElementById("predict-box").style.display = "table-cell";
    document.getElementById("prediction").innerHTML = `Нажмите "Классифицировать" для получения прогноза`;

    document.getElementById("select-file-box").style.display = "table-cell";
    document.getElementById("predict-list").innerHTML = "";

    const loadDemoImageButton = document.getElementById('demo-image-button');

    // base_path = "dataset/test/tennis.jpeg";
    const base_path = "assets/test/";

    const minimum = 1;
    const maximum = 2;

    const randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

    const img_path = base_path + randomnumber + ".jpeg"
    // img_path = base_path;

    document.getElementById("test-image").src = img_path;
    loadDemoImageButton.style.backgroundColor = 'green';
    loadDemoImageButton.style.borderColor = 'green';
}
