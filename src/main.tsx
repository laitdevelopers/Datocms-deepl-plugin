import { connect, RenderItemFormSidebarPanelCtx } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import ConfigScreen from "./entrypoints/ConfigScreen";
import { render } from "./utils/render";
import {
	Button,
	Canvas,
	CaretDownIcon,
	CaretUpIcon,
	Dropdown,
	DropdownMenu,
	DropdownOption,
	Spinner,
	TextareaField,
} from "datocms-react-ui";
import { useState } from "react";
import { availableSourceLanguages } from "./utils/languages";

connect({
	renderConfigScreen(ctx) {
		return render(<ConfigScreen ctx={ctx} />);
	},
	itemFormSidebarPanels() {
		return [
			{
				id: "deepl-panel",
				label: "DeepL Translation",
				startOpen: false,
				placement: ["before", "info"],
				rank: 1,
			},
		];
	},
	renderItemFormSidebarPanel(_sidebarPanelId, ctx: RenderItemFormSidebarPanelCtx) {
		const SidebarPanel = () => {
			const [originalText, setOriginalText] = useState("");
			const [translatedText, setTranslatedText] = useState("");
			const [sourceLanguage, setSourceLanguage] = useState(ctx.ui.locale);
			const [isLoading, setIsLoading] = useState(false);
			const apiKey = ctx.plugin.attributes.parameters.apiKey;

			const handleTranslate = async () => {
				if (!originalText) {
					ctx.alert("Please enter text to translate");
					return;
				}

				if (!apiKey) {
					ctx.alert("Please configure DeepL API key in plugin settings");
					return;
				}

				try {
					setIsLoading(true);
					const response = await fetch("/api-deepl/v2/translate", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `DeepL-Auth-Key ${apiKey}`,
							"Access-Control-Allow-Origin": "*",
						},
						body: JSON.stringify({
							text: [originalText],
							target_lang: ctx.locale.split("-")[0],
							source_lang: sourceLanguage,
						}),
					});

					if (!response.ok) {
						throw new Error(`DeepL API error: ${response.status}`);
					}

					const data = await response.json();
					const translation = data.translations[0].text;

					setTranslatedText(translation);
					ctx.notice("Translation completed!");
				} catch (error) {
					console.error("Translation error:", error);
					const errorMessage = error instanceof Error ? error.message : String(error);
					ctx.alert(`Translation failed: ${errorMessage}`);
				} finally {
					setIsLoading(false);
				}
			};

			const copyTranslation = () => {
				if (translatedText) {
					navigator.clipboard.writeText(translatedText);
					ctx.notice("Translation copied to clipboard!");
				} else {
					ctx.alert("No translation to copy.");
				}
			};

			return (
				<Canvas ctx={ctx}>
					{isLoading && (
						<div
							style={{
								height: "100%",
								width: "100%",
								background: "rgba(255, 255, 255, 0.9)",
								position: "absolute",
								zIndex: 10,
							}}
						>
							<Spinner size={48} placement="centered" />
						</div>
					)}
					<div style={{ marginBottom: "var(--spacing-l" }}>
						<span>Translate from</span>
						<Dropdown
							renderTrigger={({ open, onClick }) => (
								<Button
									buttonSize="xxs"
									onClick={onClick}
									rightIcon={open ? <CaretUpIcon /> : <CaretDownIcon />}
								>
									{availableSourceLanguages.find(
										(lang) => lang.code === sourceLanguage.split("-")[0].toUpperCase()
									)?.name ?? "ERROR"}
								</Button>
							)}
						>
							<DropdownMenu>
								{availableSourceLanguages.map((language) => (
									<DropdownOption
										key={language.code}
										onClick={() => setSourceLanguage(language.code)}
									>
										{language.name}
									</DropdownOption>
								))}
							</DropdownMenu>
						</Dropdown>
					</div>
					<TextareaField
						id="textarea"
						label="Original text"
						name="Original text"
						value={originalText}
						onChange={(newValue) => {
							setOriginalText(newValue);
						}}
					/>
					<Button
						style={{ marginTop: "var(--spacing-s" }}
						buttonType="primary"
						buttonSize="xxs"
						onClick={handleTranslate}
					>
						Translate to{" "}
						{availableSourceLanguages
							.find((lang) => lang.code === ctx.locale.split("-")[0].toUpperCase())
							?.name.toLowerCase()}
					</Button>

					<div style={{ marginTop: "var(--spacing-l" }}>
						<TextareaField
							id="translated"
							label="Translated text"
							name="Translated text"
							value={translatedText}
							onChange={undefined}
						/>
						<Button style={{ marginTop: "var(--spacing-s" }} buttonSize="xxs" onClick={copyTranslation}>
							Copy
						</Button>
					</div>
				</Canvas>
			);
		};

		return render(<SidebarPanel />);
	},
});
