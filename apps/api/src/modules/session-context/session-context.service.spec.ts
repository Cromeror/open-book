import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SessionContextService } from './session-context.service';

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  isSuperAdmin: false,
};

const mockUserState = {
  id: 'state-1',
  userId: 'user-1',
  selectedCondominiumId: 'condo-1',
  theme: 'system',
  language: 'es',
  sidebarCollapsed: false,
};

const mockCondominium = {
  id: 'condo-1',
  name: 'Condominio Test',
};

describe('SessionContextService', () => {
  let service: SessionContextService;
  let cacheManager: Record<string, ReturnType<typeof vi.fn>>;
  let usersService: Record<string, ReturnType<typeof vi.fn>>;
  let userStateService: Record<string, ReturnType<typeof vi.fn>>;
  let condominiumsService: Record<string, ReturnType<typeof vi.fn>>;
  let configService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    cacheManager = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
    };

    usersService = {
      findById: vi.fn().mockResolvedValue(mockUser),
    };

    userStateService = {
      getOrCreate: vi.fn().mockResolvedValue(mockUserState),
    };

    condominiumsService = {
      findOne: vi.fn().mockResolvedValue(mockCondominium),
    };

    configService = {
      get: vi.fn().mockReturnValue(300000),
    };

    service = new SessionContextService(
      usersService as any,
      userStateService as any,
      condominiumsService as any,
      configService as any,
      cacheManager as any,
    );
  });

  describe('getContext - cache miss', () => {
    it('should resolve from DB and store in cache on first call', async () => {
      const result = await service.getContext('user-1');

      expect(cacheManager.get).toHaveBeenCalledWith('session-context:user-1');
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
      expect(userStateService.getOrCreate).toHaveBeenCalledWith('user-1');
      expect(condominiumsService.findOne).toHaveBeenCalledWith('condo-1', 'user-1');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'session-context:user-1',
        expect.objectContaining({ userId: 'user-1' }),
        300000,
      );
      expect(result).toEqual({
        userId: 'user-1',
        userEmail: 'test@test.com',
        userFirstName: 'Test',
        userLastName: 'User',
        isSuperAdmin: false,
        condominiumId: 'condo-1',
        condominiumName: 'Condominio Test',
        userStateTheme: 'system',
        userStateLanguage: 'es',
        userStateSidebarCollapsed: false,
      });
    });
  });

  describe('getContext - cache hit', () => {
    it('should return cached data without querying DB', async () => {
      const cachedContext = {
        userId: 'user-1',
        userEmail: 'test@test.com',
        userFirstName: 'Test',
        userLastName: 'User',
        isSuperAdmin: false,
        condominiumId: 'condo-1',
        condominiumName: 'Condominio Test',
        userStateTheme: 'system',
        userStateLanguage: 'es',
        userStateSidebarCollapsed: false,
      };
      cacheManager.get.mockResolvedValue(cachedContext);

      const result = await service.getContext('user-1');

      expect(cacheManager.get).toHaveBeenCalledWith('session-context:user-1');
      expect(usersService.findById).not.toHaveBeenCalled();
      expect(userStateService.getOrCreate).not.toHaveBeenCalled();
      expect(condominiumsService.findOne).not.toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(result).toEqual(cachedContext);
    });
  });

  describe('invalidateContext', () => {
    it('should delete cache entry for the user', async () => {
      await service.invalidateContext('user-1');

      expect(cacheManager.del).toHaveBeenCalledWith('session-context:user-1');
    });

    it('should force DB resolution on next getContext call', async () => {
      const cachedContext = {
        userId: 'user-1',
        userEmail: 'test@test.com',
        userFirstName: 'Test',
        userLastName: 'User',
        isSuperAdmin: false,
        condominiumId: 'condo-1',
        condominiumName: 'Condominio Test',
        userStateTheme: 'system',
        userStateLanguage: 'es',
        userStateSidebarCollapsed: false,
      };

      // First call: cache hit
      cacheManager.get.mockResolvedValueOnce(cachedContext);
      await service.getContext('user-1');
      expect(usersService.findById).not.toHaveBeenCalled();

      // Invalidate
      await service.invalidateContext('user-1');

      // Second call: cache miss, resolves from DB
      cacheManager.get.mockResolvedValueOnce(null);
      await service.getContext('user-1');
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getContext - edge cases', () => {
    it('should return empty context when user is not found', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.getContext('unknown-user');

      expect(result).toEqual({
        userId: 'unknown-user',
        userEmail: '',
        userFirstName: '',
        userLastName: '',
        isSuperAdmin: false,
        condominiumId: '',
        condominiumName: '',
        userStateTheme: 'system',
        userStateLanguage: 'es',
        userStateSidebarCollapsed: false,
      });
    });

    it('should resolve context without condominium when none is selected', async () => {
      userStateService.getOrCreate.mockResolvedValue({
        ...mockUserState,
        selectedCondominiumId: null,
      });

      const result = await service.getContext('user-1');

      expect(condominiumsService.findOne).not.toHaveBeenCalled();
      expect(result.condominiumId).toBe('');
      expect(result.condominiumName).toBe('');
    });

    it('should handle condominium lookup failure gracefully', async () => {
      condominiumsService.findOne.mockRejectedValue(new Error('Not found'));

      const result = await service.getContext('user-1');

      expect(result.condominiumId).toBe('');
      expect(result.condominiumName).toBe('');
      expect(result.userId).toBe('user-1');
    });
  });

  describe('getMetadata', () => {
    it('should return all field descriptors with correct types', async () => {
      const result = await service.getMetadata();

      expect(result.fields).toHaveLength(10);
      expect(result.fields).toEqual([
        { name: 'userId', type: 'string' },
        { name: 'userEmail', type: 'string' },
        { name: 'userFirstName', type: 'string' },
        { name: 'userLastName', type: 'string' },
        { name: 'isSuperAdmin', type: 'boolean' },
        { name: 'condominiumId', type: 'string' },
        { name: 'condominiumName', type: 'string' },
        { name: 'userStateTheme', type: 'string' },
        { name: 'userStateLanguage', type: 'string' },
        { name: 'userStateSidebarCollapsed', type: 'boolean' },
      ]);
    });

    it('should cache metadata on first call', async () => {
      await service.getMetadata();

      expect(cacheManager.set).toHaveBeenCalledWith(
        'session-context:metadata',
        expect.objectContaining({ fields: expect.any(Array) }),
        300000,
      );
    });

    it('should return from cache on second call', async () => {
      const cachedMetadata = {
        fields: [{ name: 'userId', type: 'string' }],
      };
      cacheManager.get.mockResolvedValue(cachedMetadata);

      const result = await service.getMetadata();

      expect(result).toEqual(cachedMetadata);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });
});
