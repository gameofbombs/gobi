namespace gobi.glCore.shaderUtils {
    /**
     * Extracts the attributes
     * @class
     * @memberof PIXI.glCore.shader
     * @param gl {WebGLRenderingContext} The current WebGL rendering context
     * @param program {WebGLProgram} The shader program to get the attributes from
     * @return attributes {Object}
     */
    export function extractAttributes(gl: WebGLRenderingContext, program: WebGLProgram) {
        var attributes: any = {};

        var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (var i = 0; i < totalAttributes; i++) {
            var attribData = gl.getActiveAttrib(program, i);
            var type = mapType(gl, attribData.type);

            attributes[attribData.name] = {
                type: type,
                size: mapSize(type),
                location: gl.getAttribLocation(program, attribData.name),
                //TODO - make an attribute object
                pointer: pointer
            };
        }

        function pointer(type: number, normalized: boolean, stride: number, start: number) {
            // console.log(this.location)
            gl.vertexAttribPointer(this.location, this.size, type || gl.FLOAT, normalized || false, stride || 0, start || 0);
        }

        return attributes;
    }
}
