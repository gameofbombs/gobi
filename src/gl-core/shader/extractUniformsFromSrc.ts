namespace gobi.glCore.shaderUtils {
	export function extractUniformsFromSrc(vertexSrc: string, fragmentSrc: string, mask: number = 0): any {
		const vertUniforms = extractUniformsFromString(vertexSrc, mask);
		const fragUniforms = extractUniformsFromString(fragmentSrc, mask);

		return (Object as any).assign(vertUniforms, fragUniforms);
	}

	function extractUniformsFromString(str: string, mask: number = 0) {
		const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');

		const uniforms: any = {};
		let nameSplit: Array<string>;

		// clean the lines a little - remove extra spaces / teabs etc
		// then split along ';'
		const lines = str.replace(/\s+/g, ' ')
			.split(/\s*;\s*/);

		// loop through..
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			if (line.indexOf('uniform') > -1) {
				const splitLine = line.split(' ');
				const type = splitLine[1];

				let name = splitLine[2];
				let size = 1;

				if (name.indexOf('[') > -1) {
					// array!
					nameSplit = name.split(/\[|]/);
					name = nameSplit[0];
					size *= Number(nameSplit[1]);
				}

				if (!name.match(maskRegex)) {
					uniforms[name] = {
						value: defaultValue(type, size),
						dirtyId: 0,
						name,
						type,
					};
				}
			}
		}

		return uniforms;
	}
}
