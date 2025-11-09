import prisma from '../db/index.js';
import { validateUUID } from '../utils/validation.js';
import { generatePDF, generatePDFFilename } from '../services/pdf.service.js';
import { 
  NotFoundError,
  ForbiddenError,
  ValidationError,
  InternalServerError 
} from '../middleware/errorHandler.js';

// Utilise le client pg via src/db/index.js

/**
 * POST /api/plays/:id/export/pdf
 * Exporter une pièce en PDF
 */
export async function exportPlayToPDF(req, res, next) {
  try {
    const { id } = req.params;
    const { templateId, versionId } = req.body;
    const userId = req.user.id;

    // Validation UUID de la pièce
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const play = await prisma.play.findUnique({
      where: { id },
      select: { 
        id: true, 
        userId: true, 
        title: true,
        htmlContent: true
      }
    });

    if (!play) {
      throw new NotFoundError('Pièce non trouvée');
    }

    if (play.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Déterminer le contenu à exporter
    let contentToExport = {
      title: play.title,
      htmlContent: play.htmlContent
    };

    // Si versionId fourni, exporter une version spécifique
    if (versionId) {
      const versionIdValidation = validateUUID(versionId);
      if (!versionIdValidation.valid) {
        throw new ValidationError('versionId invalide');
      }

      const version = await prisma.playVersion.findUnique({
        where: { id: versionId },
        select: {
          playId: true,
          title: true,
          htmlContent: true
        }
      });

      if (!version) {
        throw new NotFoundError('Version non trouvée');
      }

      // Vérifier que la version appartient bien à cette pièce
      if (version.playId !== id) {
        throw new ForbiddenError('Cette version n\'appartient pas à cette pièce');
      }

      contentToExport = {
        title: version.title,
        htmlContent: version.htmlContent
      };
    }

    // Récupérer le template
    let templateSettings = null;

    if (templateId) {
      const templateIdValidation = validateUUID(templateId);
      if (!templateIdValidation.valid) {
        throw new ValidationError('templateId invalide');
      }

      const template = await prisma.exportTemplate.findUnique({
        where: { id: templateId },
        select: {
          userId: true,
          settings: true
        }
      });

      if (!template) {
        throw new NotFoundError('Template non trouvé');
      }

      // Vérifier ownership (sauf templates globaux)
      if (template.userId && template.userId !== userId) {
        throw new ForbiddenError('Accès non autorisé à ce template');
      }

      templateSettings = template.settings;
    } else {
      // Chercher le template par défaut de l'utilisateur pour cette pièce
      const defaultTemplate = await prisma.exportTemplate.findFirst({
        where: {
          userId,
          OR: [
            { playId: id },      // Template spécifique à cette pièce
            { playId: null }     // Template général de l'utilisateur
          ],
          isDefault: true
        },
        orderBy: [
          { playId: 'desc' }     // Priorité au template spécifique à la pièce
        ],
        select: {
          settings: true
        }
      });

      if (defaultTemplate) {
        templateSettings = defaultTemplate.settings;
      }
      // Si aucun template par défaut, generatePDF utilisera les settings par défaut
    }

    // Génération du PDF
    const pdfBuffer = await generatePDF(
      contentToExport.htmlContent,
      templateSettings,
      contentToExport.title
    );

    // Génération du nom de fichier
    const filename = generatePDFFilename(contentToExport.title);

    // Log pour traçabilité
    console.log('[EXPORT] PDF généré:', contentToExport.title, 'par', req.user.username);

    // Envoi du PDF en réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    // Si erreur lors de la génération du PDF
    if (error.message === 'Impossible de générer le PDF') {
      next(new InternalServerError('Erreur lors de la génération du PDF'));
    } else {
      next(error);
    }
  }
}