import { useParams } from "react-router";

const VisualizerId = () => {
	const { id } = useParams();

	return (
		<div className="visualizer-route">
			<h1>Visualizer Page</h1>
			<p>Project ID: {id}</p>
		</div>
	);
};

export default VisualizerId;
