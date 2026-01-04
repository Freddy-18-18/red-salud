
function slugify(text) {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
}

const paramsId = "cardiologia";
const masterName = "Cardiología";

console.log(`Params ID: '${paramsId}'`);
console.log(`Master Name: '${masterName}'`);
console.log(`Slugified Master: '${slugify(masterName)}'`);

if (slugify(masterName) === paramsId) {
    console.log("MATCH SUCCESS");
} else {
    console.log("MATCH FAILED");
}
