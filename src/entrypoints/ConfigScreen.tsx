import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, FieldGroup, Form, TextField } from "datocms-react-ui";
import { useState } from "react";

type Props = {
	ctx: RenderConfigScreenCtx;
};

export default function ConfigScreen({ ctx }: Props) {
	const parameters = ctx.plugin.attributes.parameters as { apiKey?: string };
	const [apiKey, setApiKey] = useState(parameters.apiKey || "");

	const handleSave = async () => {
		await ctx.updatePluginParameters({
			apiKey,
		});
		ctx.notice("Settings saved successfully!");
	};
	return (
		<Canvas ctx={ctx}>
			<Form onSubmit={handleSave}>
				<FieldGroup>
					<TextField
						id="apiKey"
						name="apiKey"
						label="DeepL API Key"
						placeholder="Enter your DeepL API key"
						value={apiKey}
						onChange={(newValue) => setApiKey(newValue)}
						required
						textInputProps={{ type: "password" }}
					/>
				</FieldGroup>
				<Button type="submit" buttonType="primary">
					Save settings
				</Button>
			</Form>
		</Canvas>
	);
}
