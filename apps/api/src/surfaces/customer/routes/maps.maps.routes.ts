import { FastifyPluginAsync } from 'fastify';
import { MapsController } from '../controllers/maps.maps.controller.js';

export const mapsRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new MapsController();

  fastify.get('/geocode', {
    preValidation: [fastify.authenticate],
    handler: controller.geocode
  });

  fastify.get('/reverse-geocode', {
    preValidation: [fastify.authenticate],
    handler: controller.reverseGeocode
  });

  fastify.get('/distance', {
    preValidation: [fastify.authenticate],
    handler: controller.calculateDistance
  });
};
