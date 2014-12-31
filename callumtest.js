<script type="text/javascript">
    $(document).ready(function() {


        $('.selectpicker').selectpicker({
            style: 'btn-default'
        });

        $("#addGroupRow").click(function() {
          $('#addGroupsTable tbody>tr:last').clone(true).insertAfter('#addGroupsTable tbody>tr:last');
          $('#addGroupsTable tbody>tr:last #groupName').val('');
          return false;
        });

        $("#addCadetRow").click(function() {
            $('#addCadetsTable tbody>tr:last').clone(true).insertAfter('#addCadetsTable tbody>tr:last');
            $('#addCadetsTable tbody>tr:last #cin').val('');
            return false;
        });

        $("#next").click(function() {
            alert("test");
            $('#groupsContainer').fadeOut();
            setTimeout(function() {$('#cadetsContainer').fadeIn() }, 400);
        });

         $("#previous").click(function() {
            $('#cadetsContainer').fadeOut();
            setTimeout(function() {$('#groupsContainer').fadeIn() }, 400);
        });

        //captures shift enter to add new rows
        var map = {13: false, 16: false};
        $(document).keydown(function(e) {
            if (e.keyCode in map) {
                map[e.keyCode] = true;
                if (map[13] && map[16]) {
                    if($('#groupsContainer').is(':visible')){
                        $('#addGroupRow').trigger("click");
                    } else {
                        $('#addCadetRow').trigger("click");
                    }
                }
            }
        }).keyup(function(e) {
            if (e.keyCode in map) {
                map[e.keyCode] = false;
            }
        });

        var socket = io.connect('/');
        socket.on('firstReceipt', function(data) {
            console.log("inside firstReceipt");
            socket.emit("getOrgGroups");
            socket.on("returnOrgGroups", function(data) {
                var orgGroups = data;
                select = document.getElementById('orgSelect');
                for(var i = 0; i < orgGroups.length; i++){
                    var opt = document.createElement('option');
                    opt.value = orgGroups[i].number;
                    opt.innerHTML = orgGroups[i].name;
                    select.appendChild(opt);
                }
                console.log("groups are " + orgGroups);
            });
            socket.emit("getRanks");
            socket.on("returnRanks", function(data) {
                var ranks = data;
                select = document.getElementById('rankSelect');
                for(var i =0; i < ranks.length; i++){
                    var  opt = document.createElement('option');
                    opt.value = ranks[i]._id;
                    opt.innerHTML = ranks[i].rankName;
                    select.appendChild(opt);
                }
                console.log("ranks are " + ranks);
            });
        });
    });
</script>