class Canvas {
    constructor(width, height, backgroundColor = '#ffffff') {
        this.size = { x: width, y: height };
        this.backgroundColor = backgroundColor;
        this.points = [];
        this.lines = [];
    }

    /**
     * Gets the center point of the canvas
     * @returns {{x: number, y: number}} The center coordinates
     */
    getCenter() {
        return {
            x: this.size.x / 2,
            y: this.size.y / 2
        };
    }

    /**
     * Gets the center of all points in the canvas
     * @returns {{x: number, y: number}} The centroid of all points
     */
    getPointsCenter() {
        if (this.points.length === 0) return this.getCenter();

        const sum = this.points.reduce((acc, point) => ({
            x: acc.x + point.x,
            y: acc.y + point.y
        }), { x: 0, y: 0 });

        return {
            x: sum.x / this.points.length,
            y: sum.y / this.points.length
        };
    }

    /**
     * Iterator for points
     * @returns {Iterator<{x: number, y: number, attributes: Object}>}
     */
    *iteratePoints() {
        for (const point of this.points) {
            yield point;
        }
    }

    /**
     * Adds a point to the canvas
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @param {Object} attributes - optional attributes for the point
     * @returns {number} id of the added point
     */
    point(x, y, attributes = {}) {
        this.points.push({
            x,
            y,
            attributes: { ...attributes }
        });
    }

    /**
     * Sets attributes for an existing point
     * @param {number} id - point id
     * @param {Object} attributes - attributes to set
     * @returns {boolean} success
     */
    setPointAttributes(id, attributes) {
        const point = this.points[id];
        if (!point) return false;
        
        point.attributes = {
            ...point.attributes,
            ...attributes
        };
        return true;
    }

    /**
     * Gets point attributes
     * @param {number} id - point id
     * @param {string} [key] - optional specific attribute key
     * @returns {any} attribute value or null if not found
     */
    getPointAttributes(id, key = null) {
        const point = this.points[id];
        if (!point) return null;
        
        if (key) {
            return point.attributes[key] ?? null;
        }
        return { ...point.attributes };
    }

    /**
     * Gets point by id
     * @param {number} id - point id
     * @returns {Object|null} point object or null if not found
     */
    getPoint(id) {
        return this.points[id] || null;
    }

    /**
     * Adds a line connecting points
     * @param {(number[]|number[][])} input - Array of point IDs or array of [x,y] coordinates
     * @param {Object} attributes - optional attributes for the created points
     * @returns {Object} Object containing line ID and array of point IDs used
     */
    line(input, attributes = {}) {
        const pointIds = [];
        
        if (Array.isArray(input[0])) {
            // Input is array of coordinates
            for (const [x, y] of input) {
                pointIds.push(this.point(x, y, attributes));
            }
        } else {
            // Input is array of point IDs
            for (const id of input) {
                if (!this.getPoint(id)) {
                    throw new Error(`Point with ID ${id} does not exist`);
                }
                pointIds.push(id);
            }
        }

        const lineId = this.lines.length;
        this.lines.push({
            id: lineId,
            points: pointIds
        });

        return {
            lineId,
            pointIds
        };
    }

    /**
     * Creates a circle by adding points and lines
     * @param {number} centerX - x coordinate of circle center
     * @param {number} centerY - y coordinate of circle center
     * @param {number} radius - radius of the circle
     * @param {number} maxEdgeLength - maximum length between points on the circle
     * @param {Object} attributes - optional attributes for the created points
     * @returns {Object} Object containing the circle's point IDs and line ID
     */
    circle(centerX, centerY, radius, maxEdgeLength, attributes = {}) {
        const circumference = 2 * Math.PI * radius;
        const numPoints = Math.ceil(circumference / maxEdgeLength);
        const angleStep = (2 * Math.PI) / numPoints;
        
        const pointIds = [];
        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            pointIds.push(this.point(x, y, attributes));
        }

        pointIds.push(pointIds[0]);
        const { lineId } = this.line(pointIds);

        return {
            pointIds: pointIds.slice(0, -1),
            lineId
        };
    }

    /**
     * Gets all points that form a line
     * @param {number} lineId - line ID
     * @returns {Object[]|null} Array of points or null if line not found
     */
    getLine(lineId) {
        const line = this.lines[lineId];
        if (!line) return null;
        
        return line.points.map(id => this.getPoint(id));
    }

    /**
     * Gets all canvas data
     * @returns {Object} Object containing all canvas data
     */
    getData() {
        return {
            dimensions: {
                width: this.width,
                height: this.height
            },
            points: this.points,
            lines: this.lines
        };
    }

    /**
     * Creates a deep copy of the canvas
     * @returns {Canvas} A new Canvas instance with copied data
     */
    clone() {
        const newCanvas = new Canvas(
            this.size.x,
            this.size.y,
            this.backgroundColor
        );
        
        // Deep copy points with their attributes
        newCanvas.points = this.points.map(point => ({
            x: point.x,
            y: point.y,
            attributes: { ...point.attributes }
        }));
        
        // Deep copy lines
        newCanvas.lines = this.lines.map(line => ({
            points: [...line.points],
            color: line.color,
            thickness: line.thickness
        }));
        
        return newCanvas;
    }

    /**
     * Merges another canvas into this one, creating a new canvas
     * @param {Canvas} otherCanvas - The canvas to merge with
     * @returns {Canvas} A new Canvas instance containing merged data
     */
    merge(otherCanvas) {
        // Create new canvas with maximum dimensions
        const newWidth = Math.max(this.size.x, otherCanvas.size.x);
        const newHeight = Math.max(this.size.y, otherCanvas.size.y);
        const mergedCanvas = new Canvas(newWidth, newHeight, this.backgroundColor);

        // Clone current canvas points and lines
        mergedCanvas.points = this.points.map(point => ({
            x: point.x,
            y: point.y,
            attributes: { ...point.attributes }
        }));

        mergedCanvas.lines = this.lines.map(line => ({
            points: [...line.points],
            color: line.color,
            thickness: line.thickness
        }));

        // Store the original points length for offset calculation
        const originalPointsLength = this.points.length;

        // Add points from other canvas (no need for IDs)
        otherCanvas.points.forEach(point => {
            mergedCanvas.points.push({
                x: point.x,
                y: point.y,
                attributes: { ...point.attributes }
            });
        });

        // Add lines from other canvas with adjusted point indices
        otherCanvas.lines.forEach(line => {
            mergedCanvas.lines.push({
                points: line.points.map(pointId => pointId + originalPointsLength),
                color: line.color,
                thickness: line.thickness
            });
        });

        return mergedCanvas;
    }

    /**
     * Gets all points that are not part of any line
     * @returns {Array} Array of points that are not used in any line
     */
    getUnconnectedPoints() {
        // Create a set of all point IDs used in lines
        const connectedPointIds = new Set(
            this.lines.flatMap(line => line.points)
        );

        // Return points that are not in the connected set
        return this.points.filter(point => !connectedPointIds.has(point.id));
    }

    /**
     * Iterator for lines
     * @returns {Iterator<{id: number, points: number[]}>}
     */
    *iterateLines() {
        for (const line of this.lines) {
            yield line;
        }
    }

    line(x1, y1, x2, y2, color = '#000000', thickness = 1) {
        // Add points if they don't exist
        let startPointIndex = this.points.findIndex(p => p.x === x1 && p.y === y1);
        if (startPointIndex === -1) {
            startPointIndex = this.points.length;
            this.points.push({ x: x1, y: y1 });
        }

        let endPointIndex = this.points.findIndex(p => p.x === x2 && p.y === y2);
        if (endPointIndex === -1) {
            endPointIndex = this.points.length;
            this.points.push({ x: x2, y: y2 });
        }

        // Add the line
        this.lines.push({
            points: [startPointIndex, endPointIndex],
            color: color,
            thickness: thickness
        });
    }

    getBounds() {
        if (!this.points.length) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }
        
        return this.points.reduce((bounds, point) => {
            if (!point) return bounds;
            return {
                minX: Math.min(bounds.minX, point.x),
                minY: Math.min(bounds.minY, point.y),
                maxX: Math.max(bounds.maxX, point.x),
                maxY: Math.max(bounds.maxY, point.y)
            };
        }, {
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        });
    }
}

export default Canvas;