class Canvas {
    constructor(width, height, backgroundColor) {
        this.size = { x: width, y: height };
        this.backgroundColor = backgroundColor;
        this.points = [];
        this.lines = [];
    }

    /**
     * Adds a point to the canvas
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @param {Object} attributes - optional attributes for the point
     * @returns {number} id of the added point
     */
    point(x, y, attributes = {}) {
        const id = this.points.length;
        this.points.push({
            id,
            x,
            y,
            attributes: { ...attributes }  // Create a copy of attributes
        });
        return id;
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
}