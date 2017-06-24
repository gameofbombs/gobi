namespace gobi.core {
    /**
     * The pixi Matrix class as an object, which makes it a lot faster,
     * here is a representation of it :
     * | a | b | tx|
     * | c | d | ty|
     * | 0 | 0 | 1 |
     *
     * @class
     * @memberof PIXI
     */
    export class Matrix {
        a: number = 1;
        b: number = 0;
        c: number = 0;
        d: number = 1;
        tx: number = 0;
        ty: number = 0;
        array: Float32Array = null;

        constructor() {
        }

        /**
         * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
         *
         * @param array - The array that the matrix will be populated from.
         */
        fromArray(array: ArrayLike<number>) {
            this.a = array[0];
            this.b = array[1];
            this.c = array[3];
            this.d = array[4];
            this.tx = array[2];
            this.ty = array[5];
        }

        /**
         * sets the matrix properties
         *
         * @param a - Matrix component
         * @param b - Matrix component
         * @param c - Matrix component
         * @param d - Matrix component
         * @param tx - Matrix component
         * @param ty - Matrix component
         *
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        set(a: number, b: number, c: number, d: number, tx: number, ty: number) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;

            return this;
        }

        /**
         * Creates an array from the current Matrix object.
         *
         * @param transpose - Whether we need to transpose the matrix or not
         * @param out - If provided the typed array will be assigned to out
         * @return the newly created typed array which contains the matrix
         */
        toArray(transpose?: boolean, out?: Float32Array): Float32Array {
            if (!this.array) {
                this.array = new Float32Array(9);
            }

            const array = out || this.array;

            if (transpose) {
                array[0] = this.a;
                array[1] = this.b;
                array[2] = 0;
                array[3] = this.c;
                array[4] = this.d;
                array[5] = 0;
                array[6] = this.tx;
                array[7] = this.ty;
                array[8] = 1;
            }
            else {
                array[0] = this.a;
                array[1] = this.c;
                array[2] = this.tx;
                array[3] = this.b;
                array[4] = this.d;
                array[5] = this.ty;
                array[6] = 0;
                array[7] = 0;
                array[8] = 1;
            }

            return array;
        }

        /**
         * Get a new position with the current transformation applied.
         * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
         *
         * @param {PIXI.Point} pos - The origin
         * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
         * @return {PIXI.Point} The new point, transformed through this matrix
         */
        apply(pos: Point, newPos: Point): Point {
            newPos = newPos || new Point();

            const x = pos.x;
            const y = pos.y;

            newPos.x = (this.a * x) + (this.c * y) + this.tx;
            newPos.y = (this.b * x) + (this.d * y) + this.ty;

            return newPos;
        }

        /**
         * Get a new position with the inverse of the current transformation applied.
         * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
         *
         * @param {PIXI.Point} pos - The origin
         * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
         * @return {PIXI.Point} The new point, inverse-transformed through this matrix
         */
        applyInverse(pos: Point, newPos: Point): Point {
            newPos = newPos || new Point();

            const id = 1 / ((this.a * this.d) + (this.c * -this.b));

            const x = pos.x;
            const y = pos.y;

            newPos.x = (this.d * id * x) + (-this.c * id * y) + (((this.ty * this.c) - (this.tx * this.d)) * id);
            newPos.y = (this.a * id * y) + (-this.b * id * x) + (((-this.ty * this.a) + (this.tx * this.b)) * id);

            return newPos;
        }

        /**
         * Translates the matrix on the x and y.
         *
         * @param {number} x How much to translate x by
         * @param {number} y How much to translate y by
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        translate(x: number, y: number): Matrix {
            this.tx += x;
            this.ty += y;

            return this;
        }

        /**
         * Applies a scale transformation to the matrix.
         *
         * @param {number} x The amount to scale horizontally
         * @param {number} y The amount to scale vertically
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        scale(x: number, y: number): Matrix {
            this.a *= x;
            this.d *= y;
            this.c *= x;
            this.b *= y;
            this.tx *= x;
            this.ty *= y;

            return this;
        }

        /**
         * Applies a rotation transformation to the matrix.
         *
         * @param {number} angle - The angle in radians.
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        rotateRad(angle: number): Matrix {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const a1 = this.a;
            const c1 = this.c;
            const tx1 = this.tx;

            this.a = (a1 * cos) - (this.b * sin);
            this.b = (a1 * sin) + (this.b * cos);
            this.c = (c1 * cos) - (this.d * sin);
            this.d = (c1 * sin) + (this.d * cos);
            this.tx = (tx1 * cos) - (this.ty * sin);
            this.ty = (tx1 * sin) + (this.ty * cos);

            return this;
        }

        /**
         * Applies a rotation transformation to the matrix.
         *
         * @param {number} angle - The angle in degrees.
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        rotateDeg(angle: number): Matrix {
            const cos = Math.cos(angle * DEG_TO_RAD);
            const sin = Math.sin(angle * DEG_TO_RAD);

            const a1 = this.a;
            const c1 = this.c;
            const tx1 = this.tx;

            this.a = (a1 * cos) - (this.b * sin);
            this.b = (a1 * sin) + (this.b * cos);
            this.c = (c1 * cos) - (this.d * sin);
            this.d = (c1 * sin) + (this.d * cos);
            this.tx = (tx1 * cos) - (this.ty * sin);
            this.ty = (tx1 * sin) + (this.ty * cos);

            return this;
        }

        /**
         * Appends the given Matrix to this Matrix.
         *
         * @param {PIXI.Matrix} matrix - The matrix to append.
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        append(matrix: Matrix): Matrix {
            const a1 = this.a;
            const b1 = this.b;
            const c1 = this.c;
            const d1 = this.d;

            this.a = (matrix.a * a1) + (matrix.b * c1);
            this.b = (matrix.a * b1) + (matrix.b * d1);
            this.c = (matrix.c * a1) + (matrix.d * c1);
            this.d = (matrix.c * b1) + (matrix.d * d1);

            this.tx = (matrix.tx * a1) + (matrix.ty * c1) + this.tx;
            this.ty = (matrix.tx * b1) + (matrix.ty * d1) + this.ty;

            return this;
        }

        setToMult(pt: Matrix, lt: Matrix) {
            const a1 = pt.a;
            const b1 = pt.b;
            const c1 = pt.c;
            const d1 = pt.d;

            this.a = (lt.a * a1) + (lt.b * c1);
            this.b = (lt.a * b1) + (lt.b * d1);
            this.c = (lt.c * a1) + (lt.d * c1);
            this.d = (lt.c * b1) + (lt.d * d1);

            this.tx = (lt.tx * a1) + (lt.ty * c1) + pt.tx;
            this.ty = (lt.tx * b1) + (lt.ty * d1) + pt.ty;
        }

        /**
         * Prepends the given Matrix to this Matrix.
         *
         * @param {PIXI.Matrix} matrix - The matrix to prepend
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        prepend(matrix: Matrix): Matrix {
            const tx1 = this.tx;

            if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
                const a1 = this.a;
                const c1 = this.c;

                this.a = (a1 * matrix.a) + (this.b * matrix.c);
                this.b = (a1 * matrix.b) + (this.b * matrix.d);
                this.c = (c1 * matrix.a) + (this.d * matrix.c);
                this.d = (c1 * matrix.b) + (this.d * matrix.d);
            }

            this.tx = (tx1 * matrix.a) + (this.ty * matrix.c) + matrix.tx;
            this.ty = (tx1 * matrix.b) + (this.ty * matrix.d) + matrix.ty;

            return this;
        }

        /**
         * Inverts this matrix
         *
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        invert(): Matrix {
            const a1 = this.a;
            const b1 = this.b;
            const c1 = this.c;
            const d1 = this.d;
            const tx1 = this.tx;
            const n = (a1 * d1) - (b1 * c1);

            this.a = d1 / n;
            this.b = -b1 / n;
            this.c = -c1 / n;
            this.d = a1 / n;
            this.tx = ((c1 * this.ty) - (d1 * tx1)) / n;
            this.ty = -((a1 * this.ty) - (b1 * tx1)) / n;

            return this;
        }

        /**
         * Resets this Matix to an identity (default) matrix.
         *
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        identity(): Matrix {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.tx = 0;
            this.ty = 0;

            return this;
        }

        /**
         * Creates a new Matrix object with the same values as this one.
         *
         * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
         */
        clone() {
            const matrix = new Matrix();

            matrix.a = this.a;
            matrix.b = this.b;
            matrix.c = this.c;
            matrix.d = this.d;
            matrix.tx = this.tx;
            matrix.ty = this.ty;

            return matrix;
        }

        /**
         * Changes the values of the given matrix to be the same as the ones in this matrix
         *
         * @param {PIXI.Matrix} matrix - The matrix to copy from.
         * @return {PIXI.Matrix} The matrix given in parameter with its values updated.
         */
        copyTo(matrix: Matrix) {
            matrix.a = this.a;
            matrix.b = this.b;
            matrix.c = this.c;
            matrix.d = this.d;
            matrix.tx = this.tx;
            matrix.ty = this.ty;

            return matrix;
        }

        /**
         * Name of matrix fields, for testing
         */
        static fields = ['a','b','c','d','tx','ty'];

        /**
         * A default (identity) matrix
         *
         * @static
         * @const
         */
        static get IDENTITY() {
            return new Matrix();
        }

        /**
         * A temp matrix
         *
         * @static
         * @const
         */
        static get TEMP_MATRIX() {
            return new Matrix();
        }
    }
}
