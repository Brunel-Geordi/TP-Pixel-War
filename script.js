$(function () {
  $("#demo").colorpicker({
    popover: false,
    inline: true,
    container: "#demo",
  });
  let pixel = [];
  pseudo = $("#user").html();
  const canvas = $("#canvas");
  const txt = $("#send");
  const validate = $("#validate");
  const ctx = canvas[0].getContext("2d");
  const ws = new WebSocket("ws://10.70.7.66:8080");

  canvas.on("click", (event) => {
    const pixel = 5;
    const rect = canvas[0].getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixel) * pixel;
    const y = Math.floor((event.clientY - rect.top) / pixel) * pixel;

    const id = `${x},${y}`;
    const data = {
      action: "draw",
      data: {
        id,
        x,
        y,
        color: $("#color").val(),
      },
    };
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });

  txt.on("click", (event) => {
    console.log(pseudo);
    if (pseudo !== "") {
      const msg = {
        action: "send",
        msg: { pseudo: pseudo, message: $("#msg").val() },
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      }
    }
  });
  validate.on("click", (event) => {
    pseudo = $("#pseudo").val();
    if (pseudo !== "") {
      $("#pseudo").val("");
      $("#log").hide();
      $("#user").html(pseudo);
      if (pseudo !== "") {
        $("#msg").prop("disabled", false);
      }
    }
  });

  ws.onmessage = (event) => {
    const { action, data, msg } = JSON.parse(event.data, event.msg);
    if (action === "draw") {
      ctx.fillStyle = data.color;
      ctx.fillRect(data.x, data.y, 5, 5);
      pixel.push(data);
      console.log(pixel);
    } else if (action === "send" && msg.message !== "") {
      $("#chat").append(
        "<li>" + msg.pseudo + ': ' + msg.message + "</li>"
      );
      $("#msg").val("");
    }
    else if (action === "initialData") {
      ctx.fillStyle = data.color;
      ctx.fillRect(data.x, data.y, 5, 5);
    }
  };
});
