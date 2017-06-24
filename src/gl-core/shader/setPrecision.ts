namespace gobi.glCore.shaderUtils {
	export function setPrecision(src: string, precision: gobi.core.PRECISION): string {
		if (src.substring(0, 9) !== 'precision') {
			return `precision ${precision} float;\n${src}`;
		}

		return src;
	}
}
