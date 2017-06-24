namespace gobi.glCore.shaderUtils {
    /**
     * Extracts the uniforms
     * @class
     * @memberof PIXI.glCore.shader
     * @param gl {WebGLRenderingContext} The current WebGL rendering context
     * @param program {WebGLProgram} The shader program to get the uniforms from
     * @return uniforms {Object}
     */
    export function extractUniforms(gl: WebGLRenderingContext, program: WebGLProgram) {
        const uniforms: any = {};

        const totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < totalUniforms; i++) {
            const uniformData = gl.getActiveUniform(program, i);
            const name = uniformData.name.replace(/\[.*?\]/, "");
            const type = mapType(gl, uniformData.type);

            uniforms[name] = {
                type: type,
                size: uniformData.size,
                location: gl.getUniformLocation(program, name),
                value: defaultValue(type, uniformData.size)
            };
        }

        return uniforms;
    }
}
