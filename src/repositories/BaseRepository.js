/**
 * Interfaz base para el patrón Repository
 * Define las operaciones CRUD básicas que debe implementar cualquier repositorio
 */
export class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            return await this.model.create(data);
        } catch (error) {
            throw new Error(`Error creating record: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await this.model.findById(id);
        } catch (error) {
            throw new Error(`Error finding record by ID: ${error.message}`);
        }
    }

    async findOne(criteria) {
        try {
            return await this.model.findOne(criteria);
        } catch (error) {
            throw new Error(`Error finding record: ${error.message}`);
        }
    }

    async findAll(criteria = {}) {
        try {
            return await this.model.find(criteria);
        } catch (error) {
            throw new Error(`Error finding records: ${error.message}`);
        }
    }

    async update(id, data) {
        try {
            return await this.model.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            throw new Error(`Error updating record: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            return await this.model.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error deleting record: ${error.message}`);
        }
    }
}