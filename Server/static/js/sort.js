$(document).ready(function () {

    var socket = io.connect('http://127.0.0.1:5000', {transports: ['websocket', 'polling', 'flashsocket']});
    var actual = 0;
    var max = 0;
    var playlist_id = $('#playlist_id').data("playlist");
    var id = $('#id').data("id");
    socket.on('connect', function () {
        socket.send('User has connected!');
    });
    socket.on('start', function (info) {
        if (info['playlist_id'] == playlist_id && info['id'] == id) {
            max = Number(info['max']);
        }
    });
    socket.on('finish', function (info) {
        if (info['playlist_id'] == playlist_id && info['id'] == id) {
            window.location.replace(window.location.origin + "/create/" + playlist_id);
        }
    });
    socket.on('update', function (info) {
        if (info['playlist_id'] == playlist_id && info['id'] == id) {
            actual = info['actual']
            var some = ((actual * 100) / max) | 0;
            var tamere = 'width: ';
            $("#pt").attr('style', tamere.concat('', some.toString(), '%'));
            $("#pt").text(''.concat('', some.toString(), '%'));
        }
    });
    socket.on('notfound', function (info) {
        if (info['playlist_id'] == playlist_id && info['id'] == id) {
            window.location.replace(window.location.origin  + "/dashboard");
        }
    })
});