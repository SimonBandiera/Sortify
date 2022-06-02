$(document).ready(function () {

    var socket = io.connect('', {transports: ['websocket', 'polling', 'flashsocket']});
    var actual = 0;
    var max = 0;
    var playlist_id = $('#playlist_id').data("playlist");
    var id = $('#id').data("id");

    socket.on('connect', function () {
        socket.emit('wait_for_sort', {playlist_id: playlist_id, id: id});
    });
    socket.on('start', function (info) {
        if (info['playlist_id'] == playlist_id && info['id'] == id) {
            max = Number(info['max']);
        }
    });
    socket.on('finish', function (info) {
        if (info['playlist_id'] == playlist_id && info['id'] == id) {
            window.location.replace(window.location.origin + "/create/" + playlist_id);
            socket.emit('end_sort', {playlist_id: playlist_id, id: id});
        }
    });
    socket.on('update', function (info) {
        if (info['playlist_id'] == playlist_id && info['id'] == id) {
            actual = info['actual']
            var pourcentage = ((actual * 100) / max) | 0;
            var base = 'width: ';
            $("#pt").attr('style', base.concat('', pourcentage.toString(), '%'));
            $("#pt").text(''.concat('', pourcentage.toString(), '%'));
        }
    });
    socket.on('notfound', function (info) {
        if (info['playlist_id'] == playlist_id && info['id'] == id) {
            window.location.replace(window.location.origin  + "/dashboard");
        }
    })
});