import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import prisma from "../prisma.js";
import AppError from "../utils/appError.js";
import * as factory from "./handleFactory.js";

export const addBook = factory.createOne("book");
export const getAllBooks = factory.getAll("book");
