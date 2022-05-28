var genres = [];
var index = 0;

function display_button() {
    if (genres.length === 0 || document.getElementById("idd").value === "") {
        document.getElementById("submit_button").className += " opacity-0";
        document.getElementById("submit_button_inner").disabled = true;
    } else {
        document.getElementById("submit_button").className = "bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-3 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out";
        document.getElementById("submit_button_inner").disabled = false;
    }
}

function myFunction(key) {
    let j = 0;
    if (document.getElementById(key).classList.contains("bg-gray-600")) {
        document.getElementById(key).className = "border-2 border-white border-opacity-20 pt-3 rounded-xl h-12 truncate text-justify hover:scale-105 duration-300 ease-in-out";
        for (let i = 0; genres[i]; i++) {
            if (genres[i] == key) {
                for (j = i; genres[j]; j++) {
                    genres[j] = genres[j + 1];
                }
            }
        }
        index -= 1;
        genres = genres.filter(element => {
            return element !== undefined;
        });
    } else {
        document.getElementById(key).className += " scale-105 bg-gray-600";
        genres[index] = key;
        index += 1;
    }
    display_button()
}

document.getElementById("submit_button_inner").disabled = true;

function myfunction2() {
    var playlist_id = document.getElementById('playlist_id').getAttribute('data-playlist');
    let form = document.getElementById("main_form");
    form.value = genres;
    form.method = "POST";
    for (let i = 0; genres[i]; i++) {
        var element = document.createElement("input");
        element.value = genres[i].toString();
        element.name = i.toString();
        form.appendChild(element);
    }
    element = document.createElement("input");
    element.value = document.getElementById("idd").value;
    element.name = "name";
    form.appendChild(element);
    form.action = "/create/" + playlist_id;
    document.body.appendChild(form);
    form.submit();
}