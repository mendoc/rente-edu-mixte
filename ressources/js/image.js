$(document).ready(function () {

   

    $('#downloader').click(function () {
        document.getElementById("downloader").download = "image.png";
        document.getElementById("downloader").href = document.getElementById("resultat").toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    });

})