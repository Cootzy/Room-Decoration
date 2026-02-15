import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useState } from "react";
import { useOutletContext } from "react-router";
import {
	PROGRESS_INTERVAL_MS,
	PROGRESS_STEP,
	REDIRECT_DELAY_MS,
} from "lib/constants";

interface UploadProps {
	onComplete?: (base64Data: string, fileName: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [progress, setProgress] = useState(0);

	const { isSignedIn } = useOutletContext<AuthContext>();

	const processFile = (selectedFile: File) => {
		if (!isSignedIn) return;

		setFile(selectedFile);
		setProgress(0);

		const reader = new FileReader();

		reader.onload = (e) => {
			const base64Data = e.target?.result as string;

			// Start progress animation
			const interval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 100) {
						clearInterval(interval);

						// Call onComplete after redirect delay
						setTimeout(() => {
							onComplete?.(base64Data, selectedFile.name);
						}, REDIRECT_DELAY_MS);

						return 100;
					}
					return Math.min(prev + PROGRESS_STEP, 100);
				});
			}, PROGRESS_INTERVAL_MS);
		};

		reader.onerror = () => {
			console.error("Failed to read file");
			setFile(null);
			setProgress(0);
		};

		reader.readAsDataURL(selectedFile);
	};

	const handleDragEnter = (e: React.DragEvent) => {
		if (!isSignedIn) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		if (!isSignedIn) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		if (!isSignedIn) return;
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		if (!isSignedIn) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile && droppedFile.type.startsWith("image/")) {
			processFile(droppedFile);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!isSignedIn) return;
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			processFile(selectedFile);
		}
	};

	return (
		<div className="upload">
			{!file ? (
				<div
					className={`dropzone ${isDragging ? "is-dragging" : ""}`}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<input
						type="file"
						className="drop-input"
						accept=".jpg,.jpeg,.png"
						disabled={!isSignedIn}
						onChange={handleChange}
					/>

					<div className="drop-content">
						<div className="drop-icon">
							<UploadIcon size={20} />
						</div>
						<p>
							{isSignedIn
								? "Click or drag and drop to upload"
								: "Sign in or sign up to upload"}
						</p>
						<p className="help">Maximum file size is 50MB</p>
					</div>
				</div>
			) : (
				<div className="upload-status">
					<div className="status-content">
						<div className="status-icon">
							{progress === 100 ? (
								<CheckCircle2 className="check" />
							) : (
								<ImageIcon className="image" />
							)}
						</div>

						<h3>{file.name}</h3>

						<div className="progress">
							<div className="bar" style={{ width: `${progress}%` }} />

							<p className="status-text">
								{progress < 100
									? "Analyzing your floor plan"
									: "Redirecting..."}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Upload;
