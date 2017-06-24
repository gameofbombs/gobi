namespace gobi.core {
    const gl = WebGLRenderingContext;

    /**
     * BlendMode: 2d compositionMode and webgl blendFunc params
     */
    export class BlendMode {
        code: number = 0;

        /**
         * Composition mode for canvas 2d context
         */
        compositionMode = 'source-over';

        /**
         * non-premultipled and premultiplied versions.
         */
        npm: Array<BlendMode> = [this, this];

        /**
         * Multiplier for the RGB source blending factors
         */
        srcRGB: number;

        /**
         * Multiplier for the RGB destination blending factors
         */
        dstRGB: number;

        /**
         * Multiplier for the alpha source blending factors
         */
        srcAlpha: number;

        /**
         * Multiplier for the alpha destination blending factor
         */
        dstAlpha: number;

        /**
         * How the RGB components of source and destination colors are combined
         */
        modeRGB: number;

        /**
         * How the alpha component of source and destination colors are combined
         */
        modeAlpha: number;


        /**
         * @param [srcRGB] Multiplier for the RGB source blending factors
         * @param [dstRGB] Multiplier for the RGB destination blending factors
         * @param [srcAlpha] Multiplier for the alpha source blending factors
         * @param [dstAlpha] Multiplier for the alpha destination blending factor
         * @param [modeRGB] How the RGB components of source and destination colors are combined
         * @param [modeAlpha] How the alpha component of source and destination colors are combined
         */
        constructor(srcRGB?: number, dstRGB?: number, srcAlpha?: number, dstAlpha?: number, modeRGB?: number, modeAlpha?: number) {
            /**
             * Composition mode for canvas 2d context
             *
             * @member {number}
             */
            this.compositionMode = 'source-over';


            this.npm = [this, this];

            this.srcRGB = srcRGB !== undefined ? srcRGB : gl.ONE;

            /**
             * Multiplier for the RGB destination blending factors
             *
             * @member {number}
             */
            this.dstRGB = dstRGB !== undefined ? dstRGB : gl.ONE_MINUS_SRC_ALPHA;

            /**
             * Multiplier for the alpha source blending factors
             *
             * @member {number}
             */
            this.srcAlpha = srcAlpha !== undefined ? srcAlpha : this.srcRGB;

            /**
             * Multiplier for the alpha destination blending factor
             *
             * @member {number}
             */
            this.dstAlpha = dstAlpha !== undefined ? dstAlpha : this.dstRGB;

            /**
             * How the RGB components of source and destination colors are combined
             *
             * @member {number}
             */
            this.modeRGB = modeRGB || gl.FUNC_ADD;

            /**
             * How the alpha component of source and destination colors are combined
             *
             * @member {number}
             */
            this.modeAlpha = modeAlpha || gl.FUNC_ADD;
        }

        /**
         * sets composition mode for 2d context
         *
         * @param compositionMode context 2d composition mode
         * @returns returns self
         */
        setCompositionMode(compositionMode: string) {
            this.compositionMode = compositionMode;

            return this;
        }

        /**
         * automatically adds non-premultiplied version of blendMode
         * @returns returns self
         */
        addNpm() {
            this.npm[0] = new BlendMode(gl.SRC_ALPHA, this.dstRGB, this.srcAlpha, this.dstAlpha, this.modeRGB, this.modeAlpha);
            this.npm[0].npm[1] = this;

            return this;
        }

        /**
         * sets composition mode for 2d context
         *
         * @param code pixi enum code
         * @returns returns self
         */
        setCode(code: number) {
            this.code = code;

            return this;
        }

        /**
         * creates context 2d composition mode that has default params for webgl
         *
         * @param compositionMode context 2d composition mode
         * @returns created object
         */
        static from2d(compositionMode: string) {
            return new BlendMode().setCompositionMode(compositionMode);
        }

        static NORMAL = new BlendMode(gl.ONE, gl.ONE_MINUS_SRC_ALPHA).addNpm().setCompositionMode('source-over');
        static ADD = new BlendMode(gl.ONE, gl.DST_ALPHA).setCompositionMode('lighter');
        static MULTIPLY = new BlendMode(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA).addNpm().setCompositionMode('multiply');
        static SCREEN = new BlendMode(gl.ONE, gl.ONE_MINUS_SRC_COLOR).addNpm().setCompositionMode('screen');
        static NONE = new BlendMode();


        /**
         * Default blend modes supported in webgl
         */
        static values = [
            BlendMode.NORMAL,
            BlendMode.ADD,
            BlendMode.MULTIPLY,
            BlendMode.SCREEN,
            BlendMode.NONE,
        ]
    }

    for (let i = 0; i < BlendMode.values.length; i++) {
        BlendMode.values[i].setCode(i);
    }
}
