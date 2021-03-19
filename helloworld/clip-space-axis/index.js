// WebGL - Fundamentals
// from https://webglfundamentals.org/webgl/webgl-fundamentals.html


/* eslint no-console:0 consistent-return:0 */
"use strict";

// 创建着色器方法，输入参数：渲染上下文，着色器类型，数据源
function createShader(gl, type, source) {
    var shader = gl.createShader(type); // 创建着色器对象
    gl.shaderSource(shader, source); // 提供数据源
    gl.compileShader(shader); // 编译 -> 生成着色器
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function main() {
    // Get A WebGL context
    var canvas = document.querySelector("#c");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        // 你不能使用WebGL！
        return;
    }

    // Get the strings for our GLSL shaders
    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

    // create GLSL shaders, upload the GLSL source, compile the shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    var program = createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();

    // WebGL可以通过绑定点操控全局范围内的许多数据，你可以把绑定点想象成一个WebGL内部的全局变量。
    // 首先绑定一个数据源到绑定点，然后可以引用绑定点指向该数据源。
    // 所以让我们来绑定位置信息缓冲（下面的绑定点就是ARRAY_BUFFER）。
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 现在我们需要通过绑定点向缓冲中存放数据
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    // 这里完成了一系列事情，第一件事是我们有了一个JavaScript序列positions 。
    // 然而WebGL需要强类型数据，所以new Float32Array(positions)创建了32位浮点型数据序列，
    // 并从positions中复制数据到序列中，然后gl.bufferData复制这些数据到GPU的positionBuffer对象上。
    // 它最终传递到positionBuffer上是因为在前一步中我们我们将它绑定到了ARRAY_BUFFER（也就是绑定点）上。
    // 最后一个参数gl.STATIC_DRAW是提示WebGL我们将怎么使用这些数据。WebGL会根据提示做出一些优化。
    // gl.STATIC_DRAW提示WebGL我们不会经常改变这些数据。

    // 在此之上的代码是 初始化代码。这些代码在页面加载时只会运行一次。
    // 接下来的代码是渲染代码，而这些代码将在我们每次要渲染或者绘制时执行。

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // 我们需要告诉WebGL怎样把提供的gl_Position裁剪空间坐标对应到画布像素坐标， 通常我们也把画布像素坐标叫做屏幕空间。
    // 为了实现这个目的，我们只需要调用gl.viewport 方法并传递画布的当前尺寸。
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // 这样就告诉WebGL裁剪空间的 -1 -> +1 分别对应到x轴的 0 -> gl.canvas.width 和y轴的 0 -> gl.canvas.height。

    // 我们用0, 0, 0, 0清空画布，分别对应 r, g, b, alpha （红，绿，蓝，阿尔法）值， 所以在这个例子中我们让画布变透明了。
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 告诉它用我们之前写好的着色程序（一个着色器对）
    gl.useProgram(program);

    // 接下来我们需要告诉WebGL怎么从我们之前准备的缓冲中获取数据给着色器中的属性。
    // 首先我们需要启用对应属性
    gl.enableVertexAttribArray(positionAttributeLocation);

    // 然后指定从缓冲中读取数据的方式
    // 将绑定点绑定到缓冲数据（positionBuffer）
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    var size = 2;          // 每次迭代运行提取两个单位数据
    var type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
    var normalize = false; // 不需要归一化数据
    var stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                           // 每次迭代运行运动多少内存到下一个数据开始点
    var offset = 0;        // 从缓冲起始位置开始读取
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset)

    // draw
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);
}

main();
