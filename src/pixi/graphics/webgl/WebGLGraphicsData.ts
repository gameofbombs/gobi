namespace gobi.pixi.graphicsUtils {
    import Point = gobi.core.Point;
    /**
     * An object containing WebGL specific properties to be used by the WebGL renderer
     *
     * @class
     * @private
     * @memberof PIXI
     */
    export class WebGLGraphicsData {
        gl: WebGLRenderingContext;
        shader: Shader;
        color: ArrayLike<number> = [0,0,0];
        points: Array<number> = [];
        indices: Array<number> = [];
        alpha: number = 0;

        buffer = new GeometryBuffer();
        indexBuffer = new GeometryBuffer();
        geometry = new Geometry()
	        .addAttribute('aVertexPosition|aColor', this.buffer)
	        .addIndex(this.indexBuffer);

        dirty: boolean;

        glPoints: Float32Array;
        glIndices: Uint16Array;

        /**
         * @param {WebGLRenderingContext} gl - The current WebGL drawing context
         * @param {PIXI.Shader} shader - The shader
         */
        constructor(gl: WebGLRenderingContext, shader: Shader) {
            /**
             * The current WebGL drawing context
             *
             * @member {WebGLRenderingContext}
             */
            this.gl = gl;

            /**
             *
             * @member {PIXI.Shader}
             */
            this.shader = shader;
        }

        /**
         * Resets the vertices and the indices
         */
        reset() {
            this.points.length = 0;
            this.indices.length = 0;
        }

        /**
         * Binds the buffers and uploads the data
         */
        upload() {
            this.glPoints = new Float32Array(this.points);
            this.buffer.update(this.glPoints);

            this.glIndices = new Uint16Array(this.indices);
            this.indexBuffer.update(this.glIndices);

            //     console.log("UPKOADING,.",this.glPoints,this.glIndices)
            this.dirty = false;
        }

        /**
         * Empties all the data
         */
        destroy() {
            this.color = null;
            this.points = null;
            this.indices = null;

            this.geometry.destroy();
            this.buffer.destroy();
            this.indexBuffer.destroy();

            this.gl = null;

            this.buffer = null;
            this.indexBuffer = null;

            this.glPoints = null;
            this.glIndices = null;
        }
    }
}
